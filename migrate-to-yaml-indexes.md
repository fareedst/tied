# Migration Guide: Markdown Table Indexes to YAML Indexes

**TIED Methodology Version**: 1.4.0  
**Audience**: AI Agents and Contributors

This document provides step-by-step instructions for migrating a project from **Markdown table-based index files** to **YAML database index files** for requirements, architecture decisions, and implementation decisions.

---

## When to Migrate

Consider migration when:
- Your TIED project uses Markdown tables in index files (from STDD v1.3.0 or earlier)
- You want easier programmatic access to index data (filtering, querying, validation)
- You want to avoid Markdown table formatting issues and merge conflicts
- You want append-only semantics for adding new records

---

## What Changes

### Before (TIED v1.3.0 and earlier)

Index files contained Markdown tables:

```markdown
## Requirements Index

| Token | Requirement | Priority | Status | Category | ... |
|-------|------------|----------|--------|----------|-----|
| `[REQ-STDD_SETUP]` | STDD Methodology Setup | P0 | ✅ Implemented | Core | ... |
```

### After (STDD v1.5.0+)

Index files are YAML databases with structured fields:

```yaml
REQ-STDD_SETUP:
  name: STDD Methodology Setup
  category: Functional
  priority: P0
  status: "Implemented"
  rationale:
    why: "To ensure traceability of intent from requirements to code"
    problems_solved:
      - "Loss of intent during development"
    benefits:
      - "Complete traceability"
  satisfaction_criteria:
    - criterion: "tied/ directory exists with proper structure"
  validation_criteria:
    - method: "Manual verification"
      coverage: "File existence checks"
  traceability:
    architecture:
      - ARCH-STDD_STRUCTURE
    implementation:
      - IMPL-STDD_FILES
    tests:
      - Manual verification checklists
    code_annotations:
      - REQ-STDD_SETUP
  metadata:
    created:
      date: 2025-11-08
      author: "AI Agent"
    last_updated:
      date: 2026-02-06
      author: "AI Agent"
      reason: "Restructured to v1.5.0"
  ...
```

The `.md` files become **guide files** that explain how to use the YAML indexes.

---

## Pre-Migration Checklist

Before starting migration:

- [ ] Confirm you're using STDD v1.3.0 or earlier (with Markdown table indexes)
- [ ] Back up your project (or ensure git history is clean)
- [ ] Identify all three index files: `requirements.md`, `architecture-decisions.md`, `implementation-decisions.md`
- [ ] Review the new templates: `requirements.template.yaml`, `architecture-decisions.template.yaml`, `implementation-decisions.template.yaml`
- [ ] Ensure you have a YAML parser available (`yq`, Python's `pyyaml`, etc.)

---

## Migration Process

### Step 1: Download New Template Files

From the STDD repository, copy these new files to your project:

```bash
# From STDD repository root
cp requirements.template.yaml /path/to/your/project/tied/requirements.yaml
cp architecture-decisions.template.yaml /path/to/your/project/tied/architecture-decisions.yaml
cp implementation-decisions.template.yaml /path/to/your/project/tied/implementation-decisions.yaml

# Also update the guide files
cp requirements.template.md /path/to/your/project/tied/requirements.md
cp architecture-decisions.template.md /path/to/your/project/tied/architecture-decisions.md
cp implementation-decisions.template.md /path/to/your/project/tied/implementation-decisions.md
```

### Step 2: Migrate Requirements Index

#### 2.1 Extract Requirements from Markdown Table

From your old `requirements.md`, extract all requirements from the Markdown tables.

**Old format (Markdown table row):**
```markdown
| `[REQ-USER_AUTH]` | User Authentication | P0 | ✅ Implemented | Functional | [ARCH-AUTH] | [IMPL-AUTH] | [Detail](requirements/REQ-USER_AUTH.md) |
```

**New format (YAML record):**
```yaml
REQ-USER_AUTH:
  name: User Authentication
  category: Functional
  priority: P0
  status: "Implemented"
  created: YYYY-MM-DD
  last_updated: YYYY-MM-DD
  rationale: |
    (Read from detail file requirements/REQ-USER_AUTH.md)
  satisfaction_criteria: |
    (Read from detail file)
  validation_criteria: |
    (Read from detail file)
  traceability: |
    **Architecture**: See `architecture-decisions.yaml` § ARCH-AUTH
    **Implementation**: See `implementation-decisions.yaml` § IMPL-AUTH
    **Tests**: testUserAuth_REQ_USER_AUTH
    **Code**: // [REQ-USER_AUTH] in source files
  related_requirements:
    depends_on: []
    related_to: []
    supersedes: []
  detail_file: requirements/REQ-USER_AUTH.md
  last_validated: YYYY-MM-DD
  last_validator: Your Name
```

#### 2.2 Manual Conversion Steps

For each requirement in your old Markdown table:

1. **Copy the template block** from the bottom of `requirements.yaml`
2. **Fill in basic fields** from the Markdown table (name, category, priority, status)
3. **Read the detail file** (`requirements/REQ-TOKEN.md`) to extract:
   - Rationale
   - Satisfaction criteria
   - Validation criteria
   - Related requirements
   - Last validated date
4. **Update traceability** to reference `.yaml` files instead of `.md` files
5. **Append to `requirements.yaml`** with a blank line before the record

#### 2.3 Scripted Conversion (Optional)

If you have many requirements, consider writing a script:

```python
import yaml
import re

# Read old Markdown table (parse manually or with regex)
# Extract: token, name, priority, status, category, arch_ref, impl_ref, detail_file

# For each requirement:
requirements = {}
for req in old_requirements:
    token = req['token'].strip('[]')  # Remove brackets
    
    # Read detail file for full information
    detail_path = f"tied/{req['detail_file']}"
    # Parse detail file sections (Description, Rationale, etc.)
    
    requirements[token] = {
        'name': req['name'],
        'category': req['category'],
        'priority': req['priority'],
        'status': req['status'],
        'created': 'YYYY-MM-DD',  # Fill manually or extract from git history
        'last_updated': 'YYYY-MM-DD',
        'rationale': extracted_rationale,
        'satisfaction_criteria': extracted_criteria,
        'validation_criteria': extracted_validation,
        'traceability': format_traceability(req),
        'related_requirements': {'depends_on': [], 'related_to': [], 'supersedes': []},
        'detail_file': req['detail_file'],
        'last_validated': 'YYYY-MM-DD',
        'last_validator': 'Migration Script'
    }

# Write to requirements.yaml
with open('tied/requirements.yaml', 'w') as f:
    # Write header comments first
    f.write("# Requirements Index (YAML Database)\n")
    f.write("# ...\n---\n\n")
    yaml.dump(requirements, f, default_flow_style=False, sort_keys=False)
```

### Step 3: Migrate Architecture Decisions Index

Similar process to requirements:

**Old format (Markdown table row):**
```markdown
| `[ARCH-AUTH_FLOW]` | Authentication Flow | Active | [REQ-USER_AUTH] | [Detail](architecture-decisions/ARCH-AUTH_FLOW.md) |
```

**New format (YAML record):**
```yaml
ARCH-AUTH_FLOW:
  name: Authentication Flow
  status: Active
  cross_references:
    - REQ-USER_AUTH
  created: YYYY-MM-DD
  last_updated: YYYY-MM-DD
  rationale: |
    (Read from detail file)
  alternatives_considered: |
    (Read from detail file)
  implementation_approach: |
    (Read from detail file)
  traceability: |
    **Requirements**: See `requirements.yaml` § REQ-USER_AUTH
    **Implementation**: See `implementation-decisions.yaml` § IMPL-AUTH
    **Tests**: testAuthFlow_ARCH_AUTH_FLOW
    **Code**: // [ARCH-AUTH_FLOW] in source files
  related_decisions:
    depends_on:
      - REQ-USER_AUTH
    informs:
      - IMPL-AUTH
    see_also: []
  detail_file: architecture-decisions/ARCH-AUTH_FLOW.md
  last_validated: YYYY-MM-DD
  last_validator: Your Name
```

Follow the same steps as requirements migration.

### Step 4: Migrate Implementation Decisions Index

**Old format (Markdown table row):**
```markdown
| `[IMPL-PASSWORD_HASH]` | Password Hashing | Active | [ARCH-AUTH_FLOW] [REQ-USER_AUTH] | [Detail](implementation-decisions/IMPL-PASSWORD_HASH.md) |
```

**New format (YAML record):**
```yaml
IMPL-PASSWORD_HASH:
  name: Password Hashing
  status: Active
  cross_references:
    - ARCH-AUTH_FLOW
    - REQ-USER_AUTH
  created: YYYY-MM-DD
  last_updated: YYYY-MM-DD
  rationale: |
    (Read from detail file)
  implementation_approach: |
    (Read from detail file)
  code_markers: |
    (Read from detail file)
  traceability: |
    **Architecture**: See `architecture-decisions.yaml` § ARCH-AUTH_FLOW
    **Requirements**: See `requirements.yaml` § REQ-USER_AUTH
    **Tests**: testPasswordHash_REQ_USER_AUTH
    **Code**: // [IMPL-PASSWORD_HASH] in source files
  related_decisions:
    depends_on: []
    supersedes: []
    see_also:
      - ARCH-AUTH_FLOW
      - REQ-USER_AUTH
  detail_file: implementation-decisions/IMPL-PASSWORD_HASH.md
  last_validated: YYYY-MM-DD
  last_validator: Your Name
```

Follow the same steps as requirements and architecture migrations.

### Step 5: Update Cross-References

After migrating all three index files, update cross-references throughout your documentation:

**Files to update:**
- `semantic-tokens.yaml` - Update token registry with new tokens or changes
- `semantic-tokens.md` - Guide remains unchanged (token format and conventions)
- `tasks.md` - Update any references to index files
- `processes.md` - Should already have `[PROC-YAML_DB_OPERATIONS]` if using new templates
- Any custom documentation that references index files

**Find and replace:**
- `requirements.md §` → `requirements.yaml §`
- `architecture-decisions.md §` → `architecture-decisions.yaml §`
- `implementation-decisions.md §` → `implementation-decisions.yaml §`

### Step 6: Validate YAML Syntax

After migration, validate all YAML files:

```bash
# Using yq
yq '.' tied/requirements.yaml > /dev/null && echo "✅ Valid" || echo "❌ Invalid"
yq '.' tied/architecture-decisions.yaml > /dev/null && echo "✅ Valid" || echo "❌ Invalid"
yq '.' tied/implementation-decisions.yaml > /dev/null && echo "✅ Valid" || echo "❌ Invalid"

# Using Python
python3 -c "import yaml; yaml.safe_load(open('tied/requirements.yaml'))" && echo "✅ Valid"
python3 -c "import yaml; yaml.safe_load(open('tied/architecture-decisions.yaml'))" && echo "✅ Valid"
python3 -c "import yaml; yaml.safe_load(open('tied/implementation-decisions.yaml'))" && echo "✅ Valid"
```

### Step 7: Verify Traceability

Check that all cross-references are correct:

```bash
# List all REQ tokens in requirements.yaml
yq 'keys' tied/requirements.yaml

# List all ARCH tokens in architecture-decisions.yaml
yq 'keys' tied/architecture-decisions.yaml

# List all IMPL tokens in implementation-decisions.yaml
yq 'keys' tied/implementation-decisions.yaml

# Check that ARCH cross-references point to valid REQ tokens
yq '.[] | select(.cross_references) | .cross_references[]' tied/architecture-decisions.yaml | sort -u

# Check that IMPL cross-references point to valid ARCH and REQ tokens
yq '.[] | select(.cross_references) | .cross_references[]' tied/implementation-decisions.yaml | sort -u
```

### Step 8: Update AGENTS.md and ai-principles.md

If you maintain custom versions of these files, update them to reference the new YAML indexes:

```bash
# Find references to old index files
grep -n "requirements\.md" tied/AGENTS.md tied/ai-principles.md
grep -n "architecture-decisions\.md" tied/AGENTS.md tied/ai-principles.md
grep -n "implementation-decisions\.md" tied/AGENTS.md tied/ai-principles.md

# Replace with .yaml references where appropriate
```

---

## Post-Migration Checklist

After migration:

- [ ] All three YAML index files exist and are valid YAML
- [ ] All records have required fields filled in
- [ ] Cross-references between files are correct
- [ ] Detail files (`requirements/*.md`, `architecture-decisions/*.md`, `implementation-decisions/*.md`) are unchanged
- [ ] Guide files (`requirements.md`, `architecture-decisions.md`, `implementation-decisions.md`) explain how to use YAML indexes
- [ ] `semantic-tokens.yaml` registry reflects all tokens (or migrate separately using `migrate-semantic-tokens-to-yaml.md`)
- [ ] `semantic-tokens.md` is the guide version with token format and conventions
- [ ] `processes.md` includes `[PROC-YAML_DB_OPERATIONS]` section
- [ ] Documentation tested with queries (see examples in `processes.md`)
- [ ] Git commit with clear message: "Migrate to YAML index files (STDD v1.4.0)"

---

## Rollback Plan

If migration fails or needs to be reverted:

1. **Restore from backup or git**:
   ```bash
   git checkout HEAD~1 -- tied/requirements.md
   git checkout HEAD~1 -- tied/architecture-decisions.md
   git checkout HEAD~1 -- tied/implementation-decisions.md
   ```

2. **Remove YAML files**:
   ```bash
   rm tied/requirements.yaml
   rm tied/architecture-decisions.yaml
   rm tied/implementation-decisions.yaml
   ```

3. **Update cross-references** back to `.md` files

---

## Benefits of YAML Indexes

After migration, you can:

- **Query programmatically**: `yq '.REQ-STDD_SETUP' requirements.yaml`
- **Filter by status**: `yq 'to_entries | map(select(.value.status == "Implemented"))' requirements.yaml`
- **Append easily**: Copy template block, paste at end, fill fields
- **Avoid merge conflicts**: Append-only semantics reduce conflicts
- **Validate syntax**: `yq '.' requirements.yaml` checks validity
- **Script operations**: Python, Ruby, Node.js all have YAML parsers
- **Maintain formatting**: YAML preserves multi-line strings and comments

---

## Example Queries After Migration

See `processes.md` § `[PROC-YAML_DB_OPERATIONS]` for comprehensive examples:

```bash
# List all P0 requirements
yq 'to_entries | map(select(.value.priority == "P0")) | from_entries' tied/requirements.yaml

# Find all architecture decisions for a specific requirement
yq '.[] | select(.cross_references[] == "REQ-USER_AUTH")' tied/architecture-decisions.yaml

# List all active implementation decisions
yq 'to_entries | map(select(.value.status == "Active")) | from_entries' tied/implementation-decisions.yaml
```

---

## Troubleshooting

### YAML Syntax Errors

**Error**: `yaml: line X: mapping values are not allowed in this context`

**Solution**: Check for unquoted strings with special characters. Use `|` for multi-line strings:

```yaml
# Bad
rationale: Why: because it's important

# Good
rationale: |
  Why: because it's important
```

### Missing Fields

**Error**: Some records are missing required fields

**Solution**: Compare your records to the template block. Ensure all required fields are present:
- Requirements: name, category, priority, status, rationale, satisfaction_criteria, validation_criteria
- Architecture: name, status, cross_references, rationale, alternatives_considered, implementation_approach
- Implementation: name, status, cross_references, rationale, implementation_approach, code_markers

### Cross-Reference Validation Failures

**Error**: Referenced tokens don't exist

**Solution**: Run this check:

```bash
# Extract all REQ tokens referenced in architecture decisions
yq '.[] | select(.cross_references) | .cross_references[]' tied/architecture-decisions.yaml | sort -u > arch_refs.txt

# Extract all REQ tokens that exist
yq 'keys | .[]' tied/requirements.yaml | sort -u > req_tokens.txt

# Find references that don't have corresponding tokens
comm -23 arch_refs.txt req_tokens.txt
```

---

## Migration from v1.4.0 to v1.5.0 (Schema Restructuring)

**Audience**: Projects using STDD v1.4.0 YAML indexes  
**Change Summary**: v1.5.0 replaces markdown-formatted string blobs with structured, machine-parseable YAML fields

### What Changed

v1.5.0 restructures five key fields to enable programmatic querying:

1. **traceability**: From markdown string to structured map with lists
2. **rationale**: From string to structured map with why/problems_solved/benefits
3. **satisfaction_criteria** (requirements): From string to list of criterion items
4. **validation_criteria** (requirements): From string to list of method items
5. **alternatives_considered** (architecture): From string to list of alternative items
6. **implementation_approach** (architecture/implementation): From string to structured map
7. **code_markers → code_locations** (implementation): Renamed and restructured
8. **metadata**: Grouped flat fields into structured metadata map

### Migration Steps

#### Step 1: Backup Your Project

```bash
git add .
git commit -m "Backup before v1.5.0 migration"
```

#### Step 2: Update Template Files

Download the new v1.5.0 templates:

```bash
# From STDD repository
cp requirements.template.yaml /path/to/your/project/tied/
cp architecture-decisions.template.yaml /path/to/your/project/tied/
cp implementation-decisions.template.yaml /path/to/your/project/tied/
```

#### Step 3: Migrate Each YAML File

For each requirement in `requirements.yaml`:

**v1.4.0 Format:**
```yaml
REQ-EXAMPLE:
  created: 2026-02-06
  last_updated: 2026-02-06
  rationale: |
    Why the requirement exists
  satisfaction_criteria: |
    - Criterion 1
    - Criterion 2
  validation_criteria: |
    - Method 1
    - Method 2
  traceability: |
    **Architecture**: See `architecture-decisions.yaml` § ARCH-EXAMPLE
    **Tests**: testExample_REQ_EXAMPLE
  last_validated: 2026-02-06
  last_validator: "Agent"
```

**v1.5.0 Format:**
```yaml
REQ-EXAMPLE:
  rationale:
    why: "Why the requirement exists"
    problems_solved:
      - "Problem 1"
    benefits:
      - "Benefit 1"
  satisfaction_criteria:
    - criterion: "Criterion 1"
    - criterion: "Criterion 2"
  validation_criteria:
    - method: "Method 1"
      coverage: "Coverage description"
    - method: "Method 2"
      coverage: "Coverage description"
  traceability:
    architecture:
      - ARCH-EXAMPLE
    implementation:
      - IMPL-EXAMPLE
    tests:
      - testExample_REQ_EXAMPLE
    code_annotations:
      - REQ-EXAMPLE
  metadata:
    created:
      date: 2026-02-06
      author: "Agent"
    last_updated:
      date: 2026-02-06
      author: "Agent"
      reason: "Migration to v1.5.0"
    last_validated:
      date: 2026-02-06
      validator: "Agent"
      result: "pass"
```

#### Step 4: Validation Script (Python)

Use this script to automate migration:

```python
import yaml
import re

def migrate_requirement(req_data):
    """Migrate a single requirement to v1.5.0 format"""
    migrated = req_data.copy()
    
    # Migrate rationale
    if isinstance(req_data.get('rationale'), str):
        migrated['rationale'] = {
            'why': req_data['rationale'].strip(),
            'problems_solved': [],
            'benefits': []
        }
    
    # Migrate satisfaction_criteria
    if isinstance(req_data.get('satisfaction_criteria'), str):
        criteria = [c.strip('- ').strip() for c in req_data['satisfaction_criteria'].split('\n') if c.strip()]
        migrated['satisfaction_criteria'] = [{'criterion': c} for c in criteria if c]
    
    # Migrate validation_criteria
    if isinstance(req_data.get('validation_criteria'), str):
        methods = [m.strip('- ').strip() for m in req_data['validation_criteria'].split('\n') if m.strip()]
        migrated['validation_criteria'] = [{'method': m, 'coverage': ''} for m in methods if m]
    
    # Migrate traceability
    if isinstance(req_data.get('traceability'), str):
        trace_text = req_data['traceability']
        migrated['traceability'] = {
            'architecture': extract_tokens(trace_text, 'ARCH'),
            'implementation': extract_tokens(trace_text, 'IMPL'),
            'tests': extract_tests(trace_text),
            'code_annotations': extract_tokens(trace_text, 'REQ')
        }
    
    # Migrate metadata
    migrated['metadata'] = {
        'created': {
            'date': req_data.get('created', 'YYYY-MM-DD'),
            'author': req_data.get('last_validator', 'Unknown')
        },
        'last_updated': {
            'date': req_data.get('last_updated', 'YYYY-MM-DD'),
            'author': req_data.get('last_validator', 'Unknown'),
            'reason': 'Migration to v1.5.0'
        },
        'last_validated': {
            'date': req_data.get('last_validated', 'YYYY-MM-DD'),
            'validator': req_data.get('last_validator', 'Unknown'),
            'result': 'pass'
        }
    }
    
    # Remove old flat fields
    for key in ['created', 'last_updated', 'last_validated', 'last_validator']:
        migrated.pop(key, None)
    
    return migrated

def extract_tokens(text, token_type):
    """Extract tokens of a specific type from markdown text"""
    pattern = f'{token_type}-[A-Z_]+'
    return re.findall(pattern, text)

def extract_tests(text):
    """Extract test names from markdown text"""
    pattern = r'test\w+_(?:REQ|ARCH|IMPL)_[A-Z_]+'
    return re.findall(pattern, text)

# Main migration
with open('tied/requirements.yaml', 'r') as f:
    requirements = yaml.safe_load(f)

migrated_requirements = {}
for token, data in requirements.items():
    if token.startswith('REQ-'):
        migrated_requirements[token] = migrate_requirement(data)
    else:
        migrated_requirements[token] = data

with open('tied/requirements.yaml', 'w') as f:
    yaml.dump(migrated_requirements, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
```

#### Step 5: Manual Review

After automated migration:

1. Review each record for accuracy
2. Fill in missing `problems_solved` and `benefits` for rationale
3. Add `metric` fields to satisfaction_criteria where applicable
4. Add `coverage` details to validation_criteria
5. Verify traceability lists are complete

#### Step 6: Update Guide Files

```bash
cp requirements.template.md /path/to/your/project/tied/requirements.md
cp architecture-decisions.template.md /path/to/your/project/tied/architecture-decisions.md
cp implementation-decisions.template.md /path/to/your/project/tied/implementation-decisions.md
cp processes.template.md /path/to/your/project/tied/processes.md
```

#### Step 7: Validate

```bash
# Validate YAML syntax
yq '.' tied/requirements.yaml > /dev/null && echo "✅ Valid"
yq '.' tied/architecture-decisions.yaml > /dev/null && echo "✅ Valid"
yq '.' tied/implementation-decisions.yaml > /dev/null && echo "✅ Valid"

# Test new queries
yq '.REQ-STDD_SETUP.traceability.architecture[]' tied/requirements.yaml
yq '.REQ-STDD_SETUP.satisfaction_criteria[].criterion' tied/requirements.yaml
```

### Benefits of v1.5.0

- **Direct field access**: `yq '.REQ-X.traceability.architecture[]'` vs parsing markdown
- **Easy filtering**: `yq '.REQ-X.satisfaction_criteria[] | select(.metric != null)'`
- **Structured queries**: Get specific parts without text parsing
- **Better validation**: Schema can be validated programmatically
- **Tool integration**: Easier to build automation tools

---

**Last Updated**: 2026-02-06  
**Migration Version**: STDD v1.3.0 → v1.4.0, v1.4.0 → v1.5.0
```
