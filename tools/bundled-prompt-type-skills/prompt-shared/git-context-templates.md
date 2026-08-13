# Git context templates (caller-supplied — paste-in only)

**Do not run git commands.** These templates are informational context the caller pastes when relevant. `git-condition:` in the prompt envelope selects which template applies.

## git_note_for_planning

### irrelevant

(no additional text)

### staged-clean

```
Git: all changes are in git stage; there is nothing in git diff.
```

### staged-unrelated-diff

```
Git: all changes are in git stage. Unrelated changes in git diff are not significant unless shown otherwise.
```

### diff-or-stage

```
Git: consider changes in git diff or stage.
```

## git_preamble_close_out

Shared constraint (all non-irrelevant conditions):

```
Do not use 'git add' or 'git commit'. Keep all changes from your response Git unstaged.
```

### staged-clean

```
Staged changes are ready for close-out.
Do not use 'git add' or 'git commit'. Keep all changes from your response Git unstaged.
All changes are in git stage; there is nothing in git diff.
```

### staged-unrelated-diff

```
Staged changes are ready for close-out.
Do not use 'git add' or 'git commit'. Keep all changes from your response Git unstaged.
All changes are in git stage. Unrelated changes in git diff are not significant unless shown otherwise.
```

### diff-or-stage

```
Staged changes are ready for close-out.
Do not use 'git add' or 'git commit'. Keep all changes from your response Git unstaged.
Consider changes in git diff or stage.
```

## git_preamble_ammend

Prefix (all conditions):

```
the changes in git stage are patches to the most recent commit.
```

Then append the matching `git_preamble_close_out` block for the caller's `git-condition`.

## git_preamble_diff_promote

Prefix (all conditions):

```
the changes in git diff are patches to files in git stage that are fully developed and ready to commit.

Diff changes are ready for close-out.
Do not use 'git add' or 'git commit'. Keep all changes from your response Git unstaged.
```

### staged-clean (suffix)

```
Treat the diff as the close-out source; stage is TIED-complete with nothing else in diff beyond these patches.
```

### staged-unrelated-diff (suffix)

```
Unrelated changes in git diff beyond the intended patches are not significant unless shown otherwise.
```

### diff-or-stage (suffix)

```
Consider changes in git diff or stage.
```

## leap-ad-hoc git notes

### staged-clean

```
Git: all changes are in git stage; there is nothing in git diff.
```

### staged-unrelated-diff

```
Git: any changes in git diff or not tracked are not relevant for this summarization.
```

### diff-or-stage

```
Git: consider changes in git diff or stage (override the default "diff not relevant" note when needed).
```
