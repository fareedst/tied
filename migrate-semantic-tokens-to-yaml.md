# Migration Guide: Semantic Tokens to YAML Index

**TIED Methodology Version**: 1.6.0  
**Audience**: AI Agents and Contributors

This document provides step-by-step instructions for migrating a project from the **Markdown-based semantic tokens registry** (v1.5.0 and earlier) to the **YAML index format** (v1.6.0+).

---

## When to Migrate

Consider migration when:
- Your TIED project uses inline token registries in `semantic-tokens.md` (from STDD v1.5.0 or earlier)
- The `semantic-tokens.md` file has become large with many token entries
- You want easier programmatic access to token data (filtering, querying, validation)
- You want consistency with how requirements, architecture decisions, and implementation decisions are indexed

---

## What Changes

### Before (TIED v1.5.0 and earlier)

`semantic-tokens.md` contained both the guide content AND inline token registries:

```markdown
## Requirements Tokens Registry

- `[REQ-STDD_SETUP]` - TIED methodology setup
- `[REQ-MODULE_VALIDATION]` - Independent module validation
...

## Architecture Tokens Registry

- `[ARCH-STDD_STRUCTURE]` - TIED project structure
...
```

### After (STDD v1.6.0+)

The registry is separated into two files:

1. **`semantic-tokens.yaml`** - YAML index/database with structured token records
2. **`semantic-tokens.md`** - Guide document (format, naming conventions, usage examples)

```yaml
# semantic-tokens.yaml
REQ-STDD_SETUP:
  type: REQ
  name: STDD Methodology Setup
  category: Core Functional
  status: Active
  description: "TIED methodology setup requirement"
  cross_references:
    - ARCH-STDD_STRUCTURE
    - IMPL-STDD_FILES
  source_index: requirements.yaml
  detail_file: requirements/REQ-STDD_SETUP.md
  metadata:
    registered: 2025-11-08
    last_updated: 2026-02-08
```

---

## Pre-Migration Checklist

Before starting migration:

- [ ] Confirm you're using STDD v1.5.0 or earlier (with inline token registries in `semantic-tokens.md`)
- [ ] Back up your project (or ensure git history is clean)
- [ ] Identify all token types in use: REQ, ARCH, IMPL, TEST, PROC
- [ ] Review the new template: `semantic-tokens.template.yaml`
- [ ] Ensure you have a YAML parser available (`yq`, Python's `pyyaml`, etc.)

---

## Migration Process

### Step 1: Download New Template Files

From the STDD repository, copy the new template files to your project:

```bash
# From STDD repository root
cp semantic-tokens.template.yaml /path/to/your/project/tied/semantic-tokens.yaml
cp semantic-tokens.template.md /path/to/your/project/tied/semantic-tokens.md.new

# Back up your current semantic-tokens.md
mv /path/to/your/project/tied/semantic-tokens.md /path/to/your/project/tied/semantic-tokens.md.backup
mv /path/to/your/project/tied/semantic-tokens.md.new /path/to/your/project/tied/semantic-tokens.md
```

### Step 2: Extract Tokens from Current Registry

From your old `semantic-tokens.md.backup`, extract all token entries from the registry sections.

**Old format (Markdown list item):**
```markdown
- `[REQ-USER_AUTH]` - User authentication requirement
```

**New format (YAML record):**
```yaml
REQ-USER_AUTH:
  type: REQ
  name: User Authentication
  category: Core Functional
  status: Active
  description: "User authentication requirement"
  cross_references:
    - ARCH-AUTH_FLOW
    - IMPL-PASSWORD_HASH
  source_index: requirements.yaml
  detail_file: requirements/REQ-USER_AUTH.md
  metadata:
    registered: YYYY-MM-DD
    last_updated: YYYY-MM-DD
```

### Step 3: Manual Conversion Steps

For each token in your old registry sections:

1. **Identify token type** from the section it's in (Requirements, Architecture, Implementation, Process)
2. **Extract token identifier** (e.g., `REQ-USER_AUTH` from `[REQ-USER_AUTH]`)
3. **Extract token name** from the description after the dash
4. **Copy the template block** from the bottom of `semantic-tokens.yaml`
5. **Fill in fields**:
   - `type`: REQ, ARCH, IMPL, TEST, or PROC
   - `name`: Descriptive name
   - `category`: Sub-category (optional; primarily for REQ tokens)
   - `status`: Active, Deprecated, Template, or Planned
   - `description`: One-line description
   - `cross_references`: List of related tokens mentioned in the old description or found in the detail file
   - `source_index`: `requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, or `processes.md`
   - `detail_file`: Path to detail file if one exists, otherwise `null`
   - `metadata.registered`: Estimate creation date from git history or use project start date
   - `metadata.last_updated`: Today's date (YYYY-MM-DD format)
6. **Append to `semantic-tokens.yaml`** with a blank line before the record

### Step 4: Scripted Conversion (Optional)

If you have many tokens, consider writing a script:

```python
import yaml
import re
from datetime import date

# Read old semantic-tokens.md
with open('tied/semantic-tokens.md.backup', 'r') as f:
    content = f.read()

# Parse token entries (adjust regex as needed)
req_pattern = r'- `\[(REQ-[A-Z_]+)\]` - (.+?)$'
arch_pattern = r'- `\[(ARCH-[A-Z_]+)\]` - (.+?)$'
impl_pattern = r'- `\[(IMPL-[A-Z_]+)\]` - (.+?)$'
proc_pattern = r'- `\[(PROC-[A-Z_]+)\]` - (.+?)$'

tokens = {}

# Extract tokens
for pattern, token_type in [
    (req_pattern, 'REQ'),
    (arch_pattern, 'ARCH'),
    (impl_pattern, 'IMPL'),
    (proc_pattern, 'PROC')
]:
    for match in re.finditer(pattern, content, re.MULTILINE):
        token_id = match.group(1)
        description = match.group(2).strip()
        
        # Extract cross-references from description
        cross_refs = re.findall(r'\[(REQ|ARCH|IMPL|TEST|PROC)-[A-Z_]+\]', description)
        
        # Determine source_index based on type
        source_map = {
            'REQ': 'requirements.yaml',
            'ARCH': 'architecture-decisions.yaml',
            'IMPL': 'implementation-decisions.yaml',
            'PROC': 'processes.md'
        }
        
        tokens[token_id] = {
            'type': token_type,
            'name': description.split('[')[0].strip(),
            'status': 'Active',  # Adjust as needed
            'description': description,
            'cross_references': cross_refs if cross_refs else [],
            'source_index': source_map[token_type],
            'detail_file': f"{token_type.lower().replace('_', '-')}/{token_id}.md",  # Adjust path
            'metadata': {
                'registered': '2025-11-08',  # Adjust date
                'last_updated': str(date.today())
            }
        }

# Write to semantic-tokens.yaml
with open('tied/semantic-tokens.yaml', 'w') as f:
    # Write header
    f.write("# Semantic Tokens Index (YAML Database)\n")
    f.write("#\n# Migrated from semantic-tokens.md\n")
    f.write("---\n\n")
    
    # Write tokens
    yaml.dump(tokens, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
```

### Step 5: Validate YAML Syntax

After migration, validate the YAML file:

```bash
# Using yq
yq '.' tied/semantic-tokens.yaml > /dev/null && echo "✅ Valid YAML" || echo "❌ Invalid YAML"

# Using Python
python3 -c "import yaml; yaml.safe_load(open('tied/semantic-tokens.yaml'))" && echo "✅ Valid" || echo "❌ Invalid"
```

### Step 6: Verify Token Coverage

Check that all tokens were migrated:

```bash
# Count tokens in old file
grep -c '^\- `\[' tied/semantic-tokens.md.backup

# Count tokens in new file
yq 'keys | length' tied/semantic-tokens.yaml

# List all tokens
yq 'keys' tied/semantic-tokens.yaml
```

### Step 7: Update Cross-References

Review cross-references to ensure they point to valid tokens:

```bash
# Get all cross-references
yq '.[] | select(.cross_references) | .cross_references[]' tied/semantic-tokens.yaml | sort -u

# Verify each referenced token exists
for token in $(yq '.[] | select(.cross_references) | .cross_references[]' tied/semantic-tokens.yaml | sort -u); do
  if yq ".[\"$token\"]" tied/semantic-tokens.yaml > /dev/null 2>&1; then
    echo "✅ $token exists"
  else
    echo "❌ $token NOT FOUND"
  fi
done
```

### Step 8: Test Queries

Test that you can query the new YAML index:

```bash
# List all REQ tokens
yq 'to_entries | map(select(.value.type == "REQ")) | from_entries | keys' tied/semantic-tokens.yaml

# Get details for a specific token
yq '.REQ-STDD_SETUP' tied/semantic-tokens.yaml

# Find tokens by status
yq 'to_entries | map(select(.value.status == "Active")) | from_entries | keys' tied/semantic-tokens.yaml

# Find all tokens cross-referencing a specific token
yq "to_entries | map(select(.value.cross_references[] == \"REQ-STDD_SETUP\")) | from_entries | keys" tied/semantic-tokens.yaml
```

---

## Post-Migration Checklist

After migration:

- [ ] `semantic-tokens.yaml` file exists and is valid YAML
- [ ] All tokens have required fields filled in
- [ ] Token count matches between old and new files
- [ ] Cross-references between tokens are correct
- [ ] `semantic-tokens.md` is the new guide-only version
- [ ] Old `semantic-tokens.md.backup` saved for reference
- [ ] Documentation tested with queries (see examples above)
- [ ] Git commit with clear message: "Migrate semantic tokens to YAML index (STDD v1.6.0)"

---

## Rollback Plan

If migration fails or needs to be reverted:

1. **Restore from backup**:
   ```bash
   mv tied/semantic-tokens.md.backup tied/semantic-tokens.md
   rm tied/semantic-tokens.yaml
   ```

2. **Or restore from git**:
   ```bash
   git checkout HEAD~1 -- tied/semantic-tokens.md
   rm tied/semantic-tokens.yaml
   ```

---

## Benefits of YAML Index

After migration, you can:

- **Query programmatically**: `yq '.REQ-STDD_SETUP' semantic-tokens.yaml`
- **Filter by type**: `yq 'to_entries | map(select(.value.type == "REQ"))' semantic-tokens.yaml`
- **Append easily**: Copy template block, paste at end, fill fields
- **Validate syntax**: `yq '.' semantic-tokens.yaml` checks validity
- **Script operations**: Python, Ruby, Node.js all have YAML parsers
- **Maintain consistency**: Same pattern as requirements, architecture, and implementation indexes

---

## Example Queries After Migration

```bash
# List all tokens
yq 'keys' tied/semantic-tokens.yaml

# List all active tokens
yq 'to_entries | map(select(.value.status == "Active")) | from_entries | keys' tied/semantic-tokens.yaml

# List all REQ tokens
yq 'to_entries | map(select(.value.type == "REQ")) | from_entries | keys' tied/semantic-tokens.yaml

# Get source index for a token (where to find full details)
yq '.REQ-STDD_SETUP.source_index' tied/semantic-tokens.yaml

# Find all tokens that cross-reference ARCH-STDD_STRUCTURE
yq 'to_entries | map(select(.value.cross_references[] == "ARCH-STDD_STRUCTURE")) | from_entries | keys' tied/semantic-tokens.yaml

# Get metadata for a token
yq '.REQ-STDD_SETUP.metadata' tied/semantic-tokens.yaml
```

---

## Troubleshooting

### YAML Syntax Errors

**Error**: `yaml: line X: mapping values are not allowed in this context`

**Solution**: Check for unquoted strings with special characters. Use quotes:

```yaml
# Bad
description: Why: because it's important

# Good
description: "Why: because it's important"
```

### Missing Tokens

**Error**: Some tokens didn't migrate

**Solution**: Check the regex patterns in your conversion script. Manually add missing tokens by copying the template block.

### Invalid Cross-References

**Error**: Cross-references point to non-existent tokens

**Solution**: Run the validation script from Step 7 and fix references.

---

**Last Updated**: 2026-02-08  
**Migration Version**: STDD v1.5.0 → v1.6.0
