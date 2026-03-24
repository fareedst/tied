# Conversation log YAML — top-level shape and agent difficulties

This note describes Cursor-style conversation logs exported as YAML (for example, large files under `~/.cursor/logs/`). It summarizes the document shape and why automated agents often struggle to edit such files safely.

## Top-level structure

The document is one **YAML sequence**: each top-level entry is a **list item** (`-`) whose value is a **mapping** with keys such as:

- `cursor_version`, `workspace_roots`, `relative_path`
- `event` (e.g. `sessionStart`, `preToolUse`, `postToolUse`)
- `generation_id`, `model`, `hook_event_name`
- `normalized` — nested map with `kind` and `details` (tool names, IDs, inputs, outputs, durations)
- `transcript` (present on at least some items) — nested list of turns with `role`, `message`, `content`, and **`text` as a block scalar** (`|-`) that can span many lines

The items in the top-level list are **heterogeneous event records**, not uniform rows; structure and depth vary by `event` and whether `transcript` is present.

## Why agents have a hard time updating YAML here

1. **Large files** — Whole-file read, naive search-replace, or “rewrite the file” workflows blow context limits, are slow, and make it easy to corrupt or only partially update the document.

2. **Deep, uneven nesting** — Paths like `normalized.details.tool_input` and `transcript[].message.content[].text` are long; a small indentation mistake breaks the whole parse for YAML that depends on spaces.

3. **Block scalars (`|-`) with embedded indented text** — Transcript `text` bodies can contain lines that look like nested YAML (`agent_preload:`, lists, maps) but are **inside a string**. Agents often confuse **string content** with **real document structure**, leading to broken block boundaries or edits in the wrong layer.

4. **Colons, paths, and special characters** — Log content is full of `:` in paths and prose; without careful quoting or escaping, automated edits produce invalid YAML (the same class of issue TIED calls out for hand-edited project YAML).

5. **Sequence boundaries** — Each logical record starts with `-` at the root of the sequence. Patching inside one item without disturbing the next `-` item requires exact awareness of list-item indentation; partial edits often merge or split items.

6. **Heterogeneous records** — Not every top-level item has the same keys; copy-paste or template-based edits can introduce keys in the wrong place or assume a shape that only some events have.

## What agents are usually trying to change

Those difficulties show up most often when the agent’s *goal* is one of the following (all of which sit in the fragile areas above):

1. **Transcript message payloads** — Under `transcript`, agents edit `message` → `content` (array of parts with `type: text` and a long `text` field, or in some logs a string `content` / `content.value` shape). Typical intents: redact secrets, shorten or summarize, fix a typo, paste in a corrected code block or YAML snippet, or align wording with a spec. Those bodies are exactly where **block scalars** and **YAML-looking prose inside strings** live.

2. **Tool I/O and hook metadata** — Under `normalized.details`, agents may try to adjust `tool_input`, `tool_output`, durations, or success flags—for example to sanitize paths, strip large blobs, or “fix” a recorded tool call. Keys and values still carry **colons and paths**; nesting must stay aligned with the parent list item.

3. **The event list itself** — Agents sometimes delete, split, merge, or reorder top-level `-` records (dedupe, remove noise, isolate one session). That requires **sequence boundaries** and **heterogeneous** shapes to stay correct; one wrong `-` indent turns two events into one mangled mapping.

4. **Cross-cutting rewrites** — Global search-and-replace over paths, tokens, or repeated phrases hits **many similar subtrees** at once; the first match pattern often updates the wrong `text` or breaks a block scalar in only some occurrences, leaving the file **partially valid** until the next “fix” pass.

## Why invalid YAML drives many reasoning cycles

The structure above turns a single logical edit into a **repair loop**:

- The agent applies a **text-level** change (replace, insert, re-indent) without consistently treating `text` as **one scalar boundary**; YAML then interprets inner lines as new keys or list items → parse error → the model tries to “fix YAML” by quoting or shifting indent, often **at the wrong depth** (string vs real node).

- **Embedded colons** (paths, `key: value` in prose) become **new mapping keys** if the block scalar is broken; each parser error prompts another patch, sometimes alternating between over-quoting and under-escaping.

- **Large files** mean the agent rarely reloads the full document between attempts; it patches from memory or a fragment, so **later cycles** correct symptoms (this line’s indent) without seeing that an earlier edit **merged two list items** or duplicated a key.

- **Heterogeneous records** encourage copying a “fixed” subtree from one `event` into another where keys differ; validation fails on the target shape, triggering more ad hoc edits.

So the “many cycles” are not usually mysterious YAML grammar bugs—they are **repeated corrections after editing the highest-risk fields** (long transcript scalars and nested tool details) while **size and block-scalar boundaries** hide mistakes until the next parse or lint check.
