# TIED Language Specification

**Version**: 0.3.0  
**Status**: Draft Specification  
**Design**: Unified syntax with pseudo-code template support

## Overview

The TIED Language is a programming language designed from the ground up to support Token-Integrated Engineering & Development (TIED). It makes semantic tokens (`[REQ-*]`, `[ARCH-*]`, `[IMPL-*]`) first-class language constructs, enabling requirements to be embedded directly in source code with compile-time and runtime traceability.

### TIED Requirements Compliance

This language specification ensures full compliance with TIED methodology requirements:

1. **Intent Preservation**: Semantic tokens preserve the "why" behind decisions throughout the development lifecycle
2. **Traceability Chain**: Complete traceability from Requirements → Architecture → Implementation → Tests → Code
3. **Token Dependency Validation**: Compile-time validation of REQ → ARCH → IMPL dependency chains
4. **Module Validation Support**: Built-in support for independent module validation before integration
5. **Test Coverage**: Automatic validation that requirements have test coverage
6. **Documentation Generation**: Auto-generate documentation from token metadata
7. **Token Registry**: Central, queryable registry of all tokens
8. **Cross-Reference Validation**: Ensure all token references are valid and complete

## Design Principles

1. **First-Class Semantic Tokens**: Tokens are language constructs, not comments
2. **Compile-Time Validation**: Token references are validated at compile time
3. **Runtime Traceability**: Tokens are queryable and traceable at runtime
4. **Unified Syntax**: Single, flexible syntax that adapts to different abstraction levels
5. **Minimal Core**: Small set of core constructs with powerful composition
6. **Progressive Abstraction**: Same syntax works for high-level and low-level code
7. **Pseudo-Code Templates**: Language supports pseudo-code that progressively refines into implementations
8. **Template-to-Implementation**: Same syntax for planning (pseudo-code) and implementation (code)

## Core Language Features

### 1. Semantic Token Declarations

Tokens are declared as first-class language constructs with required metadata:

```stdd
// Requirement declaration (REQ:*)
req USER_LOGIN {
  description: "Users must be able to authenticate securely"
  rationale: "Security requirement for access control"
  priority: P0
  // Optional: satisfaction criteria, validation criteria
}

// Architecture declaration (ARCH:*)
// Must reference at least one [REQ-*]
arch AUTHENTICATION {
  description: "Password-based authentication system"
  rationale: "Simple, secure, widely understood"
  depends: [REQ-USER_LOGIN]  // Required: must reference REQ
}

// Implementation declaration (IMPL:*)
// Must reference at least one [ARCH-*] and one [REQ-*]
impl PASSWORD_HASH {
  description: "Hash passwords using bcrypt"
  rationale: "Industry standard, secure hashing"
  depends: [ARCH-AUTHENTICATION, REQ:USER_LOGIN]  // Required: must reference ARCH and REQ
}
```

**Token Declaration Requirements**:
- `description`: Required for all token types
- `rationale`: Required for all token types (preserves "why")
- `depends`: Required for ARCH (must reference REQ) and IMPL (must reference ARCH and REQ)
- `priority`: Optional for REQ (P0, P1, P2, P3)

### 2. Token-Annotated Functions (Pseudo-Code to Implementation)

Functions can start as pseudo-code templates with semantic tokens and progressively refine into implementations:

```stdd
// PHASE 1: Pseudo-Code Template (Planning)
// Semantic tokens define the template structure
[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  // TODO: Hash password using secure algorithm
  // TODO: Verify against database
  // TODO: Return authentication result
  return false  // Placeholder
}

// PHASE 2: Partial Implementation (Refinement)
[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  // [IMPL-PASSWORD_HASH] Hash password using bcrypt
  hashed = bcrypt.hash(password)
  
  // TODO: Verify against database
  // TODO: Return authentication result
  return false  // Placeholder
}

// PHASE 3: Complete Implementation
[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  // [IMPL-PASSWORD_HASH] Hash password using bcrypt
  hashed = bcrypt.hash(password)
  
  // [IMPL-DB_VERIFICATION] Verify against database
  return db.verify(user, hashed)
}
```

**Pseudo-Code Features**:
- `TODO:` comments mark incomplete sections
- Placeholder return values (`return false`, `return null`, etc.)
- Semantic tokens provide structure even when implementation is incomplete
- Compiler accepts pseudo-code and tracks completion status
- Progressive refinement: same function evolves from template to implementation

### 3. Token Scoping

Tokens apply to code blocks automatically:

```stdd
[REQ-FILE_MONITORING] {
  // All code in this block traces to FILE_MONITORING
  [ARCH-POLLING_STRATEGY] {
    // Nested token scoping
    [IMPL-FILE_STATE_TRACKING] {
      def check_file(path: String): Bool {
        // Implementation automatically traces to all parent tokens
        return file_modified(path)
      }
    }
  }
}
```

### 4. Token Queries (Language Primitives)

Query tokens as first-class operations:

```stdd
// Find all code implementing a requirement
trace(REQ:USER_LOGIN)  // Returns list of functions/modules

// Verify token dependencies
verify(IMPL:PASSWORD_HASH)  // Validates [ARCH-AUTHENTICATION] and [REQ-USER_LOGIN] exist

// Check token coverage
coverage(REQ:USER_LOGIN)  // Returns: 100% (all requirements have implementations)

// Find orphaned code (code without tokens)
orphans()  // Returns code blocks without token annotations
```

### 5. Compile-Time Token Validation

The compiler validates token relationships:

```stdd
// This would fail at compile time:
impl INVALID_IMPL {
  depends: [ARCH-NONEXISTENT]  // Error: ARCH:NONEXISTENT not found
}

// This would also fail:
[IMPL-INVALID_IMPL]  // Error: IMPL:INVALID_IMPL depends on undefined ARCH:NONEXISTENT
def some_function() { }
```

### 6. Token-Aware Type System

Types can carry token information:

```stdd
// Type with requirement annotation
type AuthenticatedUser [REQ-USER_LOGIN] {
  username: String
  token: String
}

// Function signature with token traceability
[REQ-USER_LOGIN] [ARCH-AUTHENTICATION]
def login(credentials: Credentials [REQ-USER_LOGIN]): AuthenticatedUser [REQ-USER_LOGIN] {
  // Implementation
}
```

### 7. Test Integration

Tests automatically reference requirements and validate coverage:

```stdd
// Test function with automatic token tracing
test "user login" [REQ-USER_LOGIN] {
  user = login("alice", "password123")
  assert user.authenticated == true
}

// Test for architecture decision
test "authentication flow" [ARCH-AUTHENTICATION] [REQ-USER_LOGIN] {
  // Test architecture implementation
}

// Test for implementation detail
test "password hashing" [IMPL-PASSWORD_HASH] [ARCH-AUTHENTICATION] [REQ-USER_LOGIN] {
  // Test implementation detail
}

// Test coverage validation (compile-time)
// Compiler ensures every [REQ-*] has at least one test
// Error if REQ:USER_LOGIN has no tests

// Runtime test coverage query
test_coverage(REQ:USER_LOGIN)  // Returns: ["user login", "authentication flow"]
test_coverage()  // Returns coverage report for all requirements
```

### 8. Module System with Token Boundaries

Modules define token-scoped boundaries and support independent validation:

```stdd
// Module declaration with token boundaries
module Authentication [REQ-USER_LOGIN] [ARCH-AUTHENTICATION] {
  // Module interface - defines contract
  interface {
    [IMPL-PASSWORD_HASH] def hash_password(pwd: String): String
    [IMPL-TOKEN_GENERATION] def generate_token(user: User): String
  }
  
  // Module implementation
  [IMPL-PASSWORD_HASH]
  def hash_password(pwd: String): String {
    return bcrypt.hash(pwd)
  }
  
  [IMPL-TOKEN_GENERATION]
  def generate_token(user: User): String {
    return jwt.generate(user)
  }
}

// Module validation - must pass before integration
validate Authentication {
  // Unit tests with mocks
  test "hash_password with mock" [REQ-USER_LOGIN] {
    // Test implementation
  }
  
  // Contract validation
  test "hash_password contract" [IMPL-PASSWORD_HASH] {
    // Verify input/output contract
  }
  
  // Edge cases
  test "hash_password edge cases" [IMPL-PASSWORD_HASH] {
    // Test edge cases
  }
  
  // Error handling
  test "hash_password error handling" [IMPL-PASSWORD_HASH] {
    // Test error scenarios
  }
}

// Import with token verification
import Authentication [REQ-USER_LOGIN]  // Verifies module satisfies requirement
```

## Pseudo-Code Templates

The language supports pseudo-code templates with semantic tokens that serve as implementation templates:

### Template Structure

Pseudo-code templates use the same syntax as implementations but with placeholders:

```stdd
// Template: Function signature with tokens defines the contract
[REQ-FILE_MONITORING] [ARCH-POLLING_STRATEGY] [IMPL-FILE_STATE_TRACKING]
def monitor_file(path: String, interval: Int) {
  // Template body with TODO markers
  // TODO: Initialize state tracking
  // TODO: Loop to check file modifications
  // TODO: Notify on changes
  // TODO: Handle errors
}

// Refined template: More detail, still pseudo-code
[REQ-FILE_MONITORING] [ARCH-POLLING_STRATEGY] [IMPL-FILE_STATE_TRACKING]
def monitor_file(path: String, interval: Int) {
  // [IMPL-FILE_STATE_TRACKING] Initialize state tracking
  last_mtime = 0  // Placeholder: actual initialization
  
  // [ARCH-POLLING_STRATEGY] Loop to check file modifications
  loop {
    // TODO: Get current file modification time
    // TODO: Compare with last_mtime
    // TODO: If changed, notify and update last_mtime
    sleep(interval)
  }
}

// Implementation: Complete code
[REQ-FILE_MONITORING] [ARCH-POLLING_STRATEGY] [IMPL-FILE_STATE_TRACKING]
def monitor_file(path: String, interval: Int) {
  // [IMPL-FILE_STATE_TRACKING] Initialize state tracking
  last_mtime = 0
  
  // [ARCH-POLLING_STRATEGY] Loop to check file modifications
  loop {
    current_mtime = file.mtime(path)
    if current_mtime > last_mtime {
      notify_change(path)
      last_mtime = current_mtime
    }
    sleep(interval)
  }
}
```

### Template Completion Tracking

The compiler tracks template completion:

```stdd
// Compiler reports template status:
Template Analysis:
  Total Functions: 10
  Complete: 7
  Templates (TODO): 2
  Partial: 1
  
  [REQ-USER_LOGIN]
    authenticate() - Complete
    login() - Template (3 TODOs)
    
  [REQ-FILE_MONITORING]
    monitor_file() - Complete
    check_file() - Partial (1 TODO)
```

### Module Templates

Modules can also be templates:

```stdd
// Module template with interface defined
module Authentication [REQ-USER_LOGIN] [ARCH-AUTHENTICATION] {
  // Interface defines the contract (template)
  interface {
    [IMPL-PASSWORD_HASH] def hash_password(pwd: String): String
    [IMPL-TOKEN_GENERATION] def generate_token(user: User): String
  }
  
  // Implementation can be template or complete
  [IMPL-PASSWORD_HASH]
  def hash_password(pwd: String): String {
    // TODO: Implement bcrypt hashing
    return ""  // Placeholder
  }
  
  [IMPL-TOKEN_GENERATION]
  def generate_token(user: User): String {
    // Complete implementation
    return jwt.generate(user)
  }
}
```

## Unified Syntax

The language uses a single, flexible syntax that adapts to different abstraction levels:

### High-Level (Expressive)

```stdd
[REQ-FILE_MONITORING] [ARCH-POLLING_STRATEGY] [IMPL-FILE_STATE_TRACKING]
def monitor_file(path: String, interval: Int) {
  last_mtime = 0
  loop {
    current_mtime = file.mtime(path)
    if current_mtime > last_mtime {
      notify_change(path)
      last_mtime = current_mtime
    }
    sleep(interval)
  }
}
```

### Mid-Level (Functional)

```stdd
[REQ-FILE_MONITORING] [ARCH-POLLING_STRATEGY]
def check_file(path: String): Bool {
  current = file.mtime(path)
  last = state.get(path, 0)
  if current > last {
    state.set(path, current)
    return true
  }
  return false
}
```

### Low-Level (Direct)

```stdd
[REQ-PERFORMANCE] [IMPL-OPTIMIZED_LOOP]
def fast_copy(source: *Byte, dest: *Byte, count: Int) {
  // Direct memory operations when needed
  memcpy(dest, source, count)
}
```

### Token Composition

Tokens can be composed flexibly:

```stdd
// Multiple tokens on one function
[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  hashed = bcrypt.hash(password)
  return db.verify(user, hashed)
}

// Token scoping for multiple functions
[REQ-FILE_MONITORING] {
  [ARCH-POLLING_STRATEGY] {
    def check_file(path: String): Bool { ... }
    def update_state(path: String): Void { ... }
  }
}
```

## Compile-Time Features

### Token Dependency Graph

The compiler builds a dependency graph:

```
[REQ-USER_LOGIN]
  └─ [ARCH-AUTHENTICATION]
      └─ [IMPL-PASSWORD_HASH]
      └─ [IMPL-TOKEN_GENERATION]
```

### Validation Rules

1. **Requirement Coverage**: Every `[REQ-*]` must have at least one implementation
2. **Dependency Chain**: `[IMPL-*]` must reference valid `[ARCH-*]` and `[REQ-*]`
3. **Architecture Chain**: `[ARCH-*]` must reference valid `[REQ-*]`
4. **Test Coverage**: Every `[REQ-*]` must have at least one test (compile-time error if missing)
5. **Orphan Detection**: Code without tokens generates warnings
6. **Module Validation**: Modules must pass validation before integration
7. **Token Completeness**: All token declarations must include description and rationale
8. **Cross-Reference Completeness**: All token dependencies must be resolvable

### Compiler Output

```stdd
// Compiler reports:
Token Analysis:
  Requirements: 15
  Architectures: 23
  Implementations: 47
  Coverage: 100%
  Orphaned Code: 2 blocks (warnings)
  Missing Tests: 3 requirements

Template Analysis:
  Total Functions: 25
  Complete: 20
  Templates (TODO): 3
  Partial: 2
  
  Incomplete by Requirement:
    [REQ-USER_LOGIN]: 1 template, 0 partial
    [REQ-FILE_MONITORING]: 0 templates, 1 partial
```

### Template Validation

The compiler validates templates:

```stdd
// Valid template: Has tokens, has TODOs, has placeholder return
[REQ-USER_LOGIN] [ARCH-AUTHENTICATION]
def login(user: String): Bool {
  // TODO: Implement login logic
  return false  // Placeholder
}

// Invalid template: Missing tokens
def login(user: String): Bool {  // Warning: No token annotations
  // TODO: Implement login logic
  return false
}

// Invalid template: Missing placeholder
[REQ-USER_LOGIN]
def login(user: String): Bool {
  // TODO: Implement login logic
  // Error: Missing return statement (no placeholder)
}
```

## Runtime Features

### Token Registry

All tokens are available at runtime with complete traceability:

```stdd
// Access token registry
registry = TokenRegistry.get()

// Query requirement tokens
req = registry.find(REQ:USER_LOGIN)
req.description      // "Users must be able to authenticate securely"
req.rationale        // "Security requirement for access control"
req.priority         // P0
req.architectures    // [ARCH-AUTHENTICATION] - all ARCH that depend on this REQ
req.implementations  // [IMPL-PASSWORD_HASH, IMPL:TOKEN_GENERATION] - all IMPL that depend on this REQ
req.tests            // [test "user login", test "login failure"] - all tests for this REQ
req.code             // [authenticate(), login()] - all code implementing this REQ

// Query architecture tokens
arch = registry.find(ARCH:AUTHENTICATION)
arch.description     // "Password-based authentication system"
arch.rationale       // "Simple, secure, widely understood"
arch.requirements    // [REQ-USER_LOGIN] - REQ this ARCH depends on
arch.implementations // [IMPL-PASSWORD_HASH] - IMPL that depend on this ARCH
arch.tests           // [test "authentication flow"] - tests for this ARCH

// Query implementation tokens
impl = registry.find(IMPL:PASSWORD_HASH)
impl.description     // "Hash passwords using bcrypt"
impl.rationale       // "Industry standard, secure hashing"
impl.requirements    // [REQ-USER_LOGIN] - REQ this IMPL depends on
impl.architectures    // [ARCH-AUTHENTICATION] - ARCH this IMPL depends on
impl.tests           // [test "password hashing"] - tests for this IMPL
impl.code            // [hash_password()] - code implementing this IMPL

// Complete traceability chain
trace_chain(REQ:USER_LOGIN)  
// Returns: REQ:USER_LOGIN → ARCH:AUTHENTICATION → IMPL:PASSWORD_HASH → hash_password() → test "password hashing"
```

### Dynamic Traceability

Trace execution to requirements:

```stdd
// Enable trace mode
trace.enable(REQ:USER_LOGIN)

// When authenticate() is called:
// Trace output:
//   [REQ-USER_LOGIN] authenticate() called
//   [ARCH-AUTHENTICATION] Using password-based auth
//   [IMPL-PASSWORD_HASH] Hashing password with bcrypt
```

### Documentation Generation

Auto-generate TIED-compliant documentation from tokens:

```stdd
// Generate documentation (compile-time and runtime)
docs = generate_docs()

// Output includes TIED-compliant structure:
// - requirements.md: All [REQ-*] tokens with descriptions, rationale, priority
// - architecture-decisions.md: All [ARCH-*] tokens with cross-references to [REQ-*]
// - implementation-decisions.md: All [IMPL-*] tokens with cross-references to [ARCH-*] and [REQ-*]
// - semantic-tokens.yaml: YAML index of all tokens with structured metadata
// - Test coverage report: Requirements covered by tests
// - Traceability matrix: Complete REQ → ARCH → IMPL → Code → Tests chain

// Generate specific documentation sections
generate_requirements()  // requirements.md format
generate_architecture()   // architecture-decisions.md format
generate_implementation() // implementation-decisions.md format
generate_token_registry()  // semantic-tokens.yaml format
```

## Standard Library

### Token Operations

```stdd
// Token manipulation
Token.declare(type, id, attributes)
Token.find(id)
Token.trace(id)
Token.verify(id)
Token.coverage()
```

### Query Operations

```stdd
// Query codebase
Query.implementations(REQ:USER_LOGIN)
Query.dependencies(IMPL:PASSWORD_HASH)
Query.orphans()
Query.missing_tests()
```

### Validation Operations

```stdd
// Validate token relationships
Validator.check_dependencies()
Validator.check_coverage()
Validator.check_orphans()
```

## IDE Integration

### Token Navigation

- Jump from `[REQ-*]` to all implementations
- Jump from `[IMPL-*]` to requirements and architecture
- Visualize token dependency graphs
- Highlight orphaned code

### Auto-Completion

- Suggest tokens based on context
- Auto-generate token annotations
- Suggest missing dependencies

### Refactoring

- Rename tokens across codebase
- Update token dependencies
- Move code between token scopes

## Example: Pseudo-Code Template to Implementation

This example shows how pseudo-code templates progressively refine into implementations:

```stdd
// ============================================
// PHASE 1: Requirements and Architecture
// ============================================

req USER_LOGIN {
  description: "Users must authenticate securely"
  rationale: "Security requirement for access control"
  priority: P0
}

arch AUTHENTICATION {
  description: "Password-based authentication system"
  rationale: "Simple, secure, widely understood"
  depends: [REQ-USER_LOGIN]
}

impl PASSWORD_HASH {
  description: "bcrypt password hashing"
  rationale: "Industry standard, secure hashing"
  depends: [ARCH-AUTHENTICATION, REQ:USER_LOGIN]
}

// ============================================
// PHASE 2: Pseudo-Code Template
// ============================================

// Template: Function signature with tokens defines structure
[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  // Template body - semantic tokens provide the structure
  // TODO: Hash password using secure algorithm [IMPL-PASSWORD_HASH]
  // TODO: Verify against database
  // TODO: Return authentication result
  return false  // Placeholder
}

// ============================================
// PHASE 3: Partial Implementation
// ============================================

[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  // [IMPL-PASSWORD_HASH] Hash password using bcrypt
  hashed = bcrypt.hash(password)
  
  // TODO: Verify against database
  // TODO: Return authentication result
  return false  // Placeholder
}

// ============================================
// PHASE 4: Complete Implementation
// ============================================

[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  // [IMPL-PASSWORD_HASH] Hash password using bcrypt
  hashed = bcrypt.hash(password)
  
  // [IMPL-DB_VERIFICATION] Verify against database
  return db.verify(user, hashed)
}

// ============================================
// PHASE 5: Tests (can also be templates)
// ============================================

// Test template
test "user login" [REQ-USER_LOGIN] {
  // TODO: Test successful login
  // TODO: Test failed login
  // TODO: Test edge cases
}

// Complete test
test "user login" [REQ-USER_LOGIN] {
  result = authenticate("alice", "password123")
  assert result == true
}
```

## Example: Complete TIED-Compliant Program

This example demonstrates a complete program following TIED methodology:

```stdd
// ============================================
// PHASE 1: Requirements (REQ:*)
// ============================================

req USER_LOGIN {
  description: "Users must authenticate securely"
  rationale: "Security requirement for access control"
  priority: P0
}

req FILE_MONITORING {
  description: "Monitor files for changes"
  rationale: "Need to detect file modifications for processing"
  priority: P1
}

// ============================================
// PHASE 2: Architecture (ARCH:*)
// ============================================

arch AUTHENTICATION {
  description: "Password-based authentication system"
  rationale: "Simple, secure, widely understood"
  depends: [REQ-USER_LOGIN]  // Must reference REQ
}

arch POLLING_STRATEGY {
  description: "Poll files periodically"
  rationale: "Simpler than file system events, cross-platform"
  depends: [REQ-FILE_MONITORING]  // Must reference REQ
}

// ============================================
// PHASE 3: Implementation (IMPL:*)
// ============================================

impl PASSWORD_HASH {
  description: "bcrypt password hashing"
  rationale: "Industry standard, secure hashing"
  depends: [ARCH-AUTHENTICATION, REQ:USER_LOGIN]  // Must reference ARCH and REQ
}

impl FILE_STATE_TRACKING {
  description: "Track file modification times"
  rationale: "Efficient way to detect changes"
  depends: [ARCH-POLLING_STRATEGY, REQ:FILE_MONITORING]  // Must reference ARCH and REQ
}

// ============================================
// PHASE 4: Code Implementation
// ============================================

[REQ-USER_LOGIN] [ARCH-AUTHENTICATION] [IMPL-PASSWORD_HASH]
def authenticate(user: String, password: String): Bool {
  hashed = bcrypt.hash(password)
  return db.verify(user, hashed)
}

[REQ-FILE_MONITORING] [ARCH-POLLING_STRATEGY] [IMPL-FILE_STATE_TRACKING]
def monitor_file(path: String, interval: Int) {
  last_mtime = 0
  loop {
    current_mtime = file.mtime(path)
    if current_mtime > last_mtime {
      notify_change(path)
      last_mtime = current_mtime
    }
    sleep(interval)
  }
}

// ============================================
// PHASE 5: Tests (must reference REQ:*)
// ============================================

// Test for requirement
test "user login" [REQ-USER_LOGIN] {
  result = authenticate("alice", "password123")
  assert result == true
}

// Test for architecture
test "authentication flow" [ARCH-AUTHENTICATION] [REQ-USER_LOGIN] {
  // Test architecture implementation
}

// Test for implementation
test "password hashing" [IMPL-PASSWORD_HASH] [ARCH-AUTHENTICATION] [REQ-USER_LOGIN] {
  hashed = bcrypt.hash("test")
  assert hashed != "test"
}

// Test for file monitoring requirement
test "file monitoring" [REQ-FILE_MONITORING] {
  // Test implementation
}

// ============================================
// Compile-time validation ensures:
// - All REQ have at least one test
// - All ARCH reference valid REQ
// - All IMPL reference valid ARCH and REQ
// - Complete traceability chain
// ============================================
```

## Implementation Considerations

### YAML IMPL pseudo-code validation

Projects that store IMPL pseudo-code in YAML (e.g. `essence_pseudocode` in IMPL detail files under `tied/implementation-decisions/`) validate it using the **application pseudo-code validation checklist** ([PROC-PSEUDOCODE_VALIDATION]). See `docs/pseudocode-writing-and-validation.md` and `docs/pseudocode-validation-checklist.yaml`. The TIED Language's template validation (e.g. Template Validation above) is complementary; the checklist applies to YAML-based pseudo-code in TIED IMPL details.

### Compiler Architecture

1. **Token Parser**: Parse token declarations and annotations
2. **Dependency Resolver**: Build token dependency graph
3. **Validator**: Check token relationships and coverage
4. **Code Generator**: Generate code with token metadata
5. **Documentation Generator**: Extract tokens for docs

### Runtime Architecture

1. **Token Registry**: Runtime token database
2. **Trace System**: Execution tracing to tokens
3. **Query Engine**: Token queries and searches
4. **Validation Engine**: Runtime token validation

### Tooling

1. **Language Server**: IDE integration
2. **Documentation Generator**: Auto-generate docs
3. **Coverage Tool**: Test coverage by requirement
4. **Refactoring Tools**: Token-aware refactoring
5. **Visualization Tools**: Token dependency graphs

## Future Enhancements

1. **Token Versioning**: Track token evolution over time
2. **Token Metrics**: Measure requirement satisfaction
3. **Token Templates**: Reusable token patterns
4. **Multi-Language Support**: Tokens across language boundaries
5. **AI Integration**: Auto-suggest tokens based on code
6. **Token Testing**: Test token relationships
7. **Token Migration**: Refactor token structures

## Comparison to Other Approaches

### vs. Documentation Comments

*TIED Language*: Tokens are first-class, validated, queryable  
**Comments**: Tokens are text, not validated, not queryable

### vs. Annotations/Attributes

*TIED Language*: Tokens have semantics, dependencies, traceability  
**Annotations**: Just metadata, no relationships

### vs. Type Systems

*TIED Language*: Tokens track intent, not just types  
**Types**: Track data structure, not purpose

## Syntax Philosophy

The language uses a single, unified syntax that adapts to different needs:

- **Minimal Core**: Small set of keywords and constructs
- **Flexible Composition**: Tokens and code compose naturally
- **Progressive Abstraction**: Same syntax works for high-level and low-level code
- **No Paradigm Switching**: One syntax, multiple abstraction levels

This approach avoids the complexity of multiple syntax variants while maintaining the flexibility to express both high-level business logic and low-level optimizations.

## Pseudo-Code as Templates: TIED Phase 1 Support

The language bridges TIED Phase 1 (Requirements → Pseudo-Code) and Phase 3 (Implementation) by using the same syntax for both:

### Template-Driven Development

1. **Planning Phase**: Write pseudo-code templates with semantic tokens
   ```stdd
   [REQ-FEATURE] [ARCH-DESIGN] [IMPL-APPROACH]
   def function_name(params): ReturnType {
     // TODO: Step 1
     // TODO: Step 2
     return placeholder
   }
   ```

2. **Refinement Phase**: Progressively fill in implementations
   ```stdd
   [REQ-FEATURE] [ARCH-DESIGN] [IMPL-APPROACH]
   def function_name(params): ReturnType {
     // Step 1 implemented
     result = step1()
     // TODO: Step 2
     return placeholder
   }
   ```

3. **Implementation Phase**: Complete the function
   ```stdd
   [REQ-FEATURE] [ARCH-DESIGN] [IMPL-APPROACH]
   def function_name(params): ReturnType {
     result = step1()
     return step2(result)
   }
   ```

### Benefits

- **Same Syntax**: No translation needed from pseudo-code to code
- **Token Preservation**: Semantic tokens maintain intent throughout refinement
- **Progressive Refinement**: Templates naturally evolve into implementations
- **Completion Tracking**: Compiler tracks which templates are complete
- **TIED Alignment**: Supports TIED Phase 1 (pseudo-code) → Phase 3 (implementation)

## TIED Methodology Compliance

This language specification ensures complete compliance with TIED methodology:

### Core TIED Principles Satisfied

1. ✅ **Intent Preservation**: Semantic tokens preserve the "why" (rationale) alongside "what" (description) and "how" (implementation)
   - **Language Feature**: Required `rationale` field in all token declarations
   - **TIED Requirement**: Preserve intent throughout development lifecycle

2. ✅ **Traceability Chain**: Complete REQ → ARCH → IMPL → Code → Tests chain with bidirectional navigation
   - **Language Feature**: Token dependency system with `depends` field, token annotations on code
   - **TIED Requirement**: Requirements → Architecture → Implementation → Tests → Code

3. ✅ **Token Dependency Validation**: Compile-time validation ensures all token dependencies are valid
   - **Language Feature**: Compile-time validation of token dependency chains
   - **TIED Requirement**: Explicit traceability with validated cross-references

4. ✅ **Module Validation Support**: Built-in `validate` blocks support independent module validation before integration
   - **Language Feature**: `validate` blocks for modules, compile-time enforcement
   - **TIED Requirement**: [REQ-MODULE_VALIDATION] - Independent module validation before integration

5. ✅ **Test Coverage Enforcement**: Compile-time requirement that every [REQ-*] has at least one test
   - **Language Feature**: Compile-time validation that all REQ have tests
   - **TIED Requirement**: Tests validate requirements are met

6. ✅ **Documentation Generation**: Auto-generate TIED-compliant documentation (requirements.md, architecture-decisions.md, etc.)
   - **Language Feature**: `generate_docs()` with TIED-compliant output formats
   - **TIED Requirement**: Living documentation connected to code via tokens

7. ✅ **Token Registry**: Central, queryable registry with complete traceability information
   - **Language Feature**: Runtime `TokenRegistry` with complete token metadata
   - **TIED Requirement**: Central registry of all tokens (semantic-tokens.yaml YAML index)

8. ✅ **Cross-Reference Completeness**: All token references validated at compile-time
   - **Language Feature**: Compile-time validation of all token references
   - **TIED Requirement**: All cross-references must be valid and complete

### TIED Workflow Support

The language supports the complete TIED workflow:

1. **Requirements Phase**: `req` declarations with description, rationale, priority
2. **Architecture Phase**: `arch` declarations that must reference `req`
3. **Implementation Phase**: `impl` declarations that must reference `arch` and `req`
4. **Module Validation Phase**: `validate` blocks for independent module testing
5. **Integration Phase**: Modules can only be imported after validation passes
6. **Test Phase**: `test` declarations that must reference `req`
7. **Documentation Phase**: Auto-generation of TIED documentation files

## Conclusion

The TIED Language makes semantic tokens first-class language constructs, enabling requirements to be embedded directly in source code with compile-time validation and runtime traceability. It uses a unified, flexible syntax that preserves intent throughout the development lifecycle without requiring paradigm switches, while ensuring full compliance with TIED methodology requirements.

### Key Innovation: Pseudo-Code Templates

The language uniquely supports pseudo-code templates with semantic tokens that serve as implementation templates. This bridges TIED Phase 1 (Requirements → Pseudo-Code) and Phase 3 (Implementation) seamlessly:

- **Same Syntax**: Pseudo-code and implementation use identical syntax - no translation needed
- **Token-Driven Structure**: Semantic tokens define the template structure and maintain intent
- **Progressive Refinement**: Templates naturally evolve from `TODO:` placeholders to complete implementations
- **Completion Tracking**: Compiler tracks template completion status and reports progress
- **Intent Preservation**: Tokens maintain intent from planning (pseudo-code) through implementation (code)

This approach ensures that the planning phase (pseudo-code with tokens) directly becomes the implementation phase (code with tokens), eliminating the gap between design and code while preserving all traceability and intent. Functions start as templates with semantic tokens and progressively refine into complete implementations, all using the same syntax.

---

**Status**: This is a draft specification. Implementation details may evolve based on practical usage and feedback.
