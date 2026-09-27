# Behavior-Bounded Change Engineering (BBCE)

## Purpose

Behavior-Bounded Change Engineering is a proposed set of software-engineering constraints for systems developed by humans and coding agents.

The central premise is:

> An externally meaningful use case should be the primary unit of architecture, change, implementation context, and verification.

A system should make the expected scope of a change obvious, bounded, testable, and measurable.

These features are intended to be matched against an existing strict engineering methodology. They are not necessarily a replacement architecture. Where the existing methodology already provides a stronger invariant, retain the stronger rule.

---

## 1. Behavior is the primary architectural unit

Every externally meaningful use case SHOULD have an identifiable owning behavioral unit or slice.

Examples include:

- Create Order
- Cancel Order
- Change Customer Address
- Get Invoice
- Approve Referral

The repository SHOULD make these behaviors more visible than generic technical layers.

Prefer organization around:

```text
CreateOrder
CancelOrder
GetOrder
UpdateCustomer
```

rather than making the primary architecture:

```text
Controllers
Services
Repositories
Validators
Models
```

Technical concerns MAY exist inside a slice, but they SHOULD NOT be the primary decomposition of application behavior.

---

## 2. The unit of architecture SHOULD approximate the unit of change

Code that normally changes together SHOULD be located together.

For behavior `B` and change `C`:

```text
affected_code(C) ≈ owning_behavior(B)
```

A normal behavior change SHOULD NOT require modification of unrelated behavioral units.

Crossing a behavioral boundary MUST be treated as a meaningful architectural event rather than an ordinary implementation detail.

---

## 3. A new use case SHOULD normally create a new slice

Feature growth SHOULD preferentially be additive.

Expected pattern:

```text
new use case
    →
new behavioral slice
```

Suspicious pattern:

```text
new use case
    →
modify controller
modify shared service
modify repository abstraction
modify generic validator
modify several unrelated features
```

Adding behavior SHOULD normally add localized implementation rather than modify broadly shared implementation.

---

## 4. Maximize cohesion within a slice

Everything specific to implementing one behavior SHOULD be colocated or immediately discoverable from that behavior.

A slice MAY contain:

```text
request
endpoint / entry point
input model
validation
orchestration
business decisions
persistence interaction
response model
tests
```

Understanding a slice SHOULD require minimal navigation outside that slice.

---

## 5. Minimize coupling between slices

One behavioral slice SHOULD NOT depend upon implementation details belonging to another slice.

Cross-slice communication MUST occur through an intentional interface, shared domain concept, event, protocol, or other explicit boundary.

A routine modification to one behavior SHOULD NOT cause implementation changes in unrelated behaviors.

---

## 6. Feature-specific decisions remain local

A rule whose meaning belongs to one use case MUST remain inside that use case or within a domain concept deliberately owned by that use case/domain.

Feature-specific behavior MUST NOT leak into:

```text
generic helpers
global validators
shared services
infrastructure utilities
middleware
framework extension points
```

Shared infrastructure MUST NOT contain branches such as:

```text
if feature == A ...
if feature == B ...
```

when those branches encode feature-specific decisions.

---

## 7. Distinguish shared mechanism from shared meaning

Repeated mechanism does not imply shared business meaning.

Examples of plausibly shared mechanisms:

```text
authentication
request logging
tracing
transaction management
error translation
serialization
telemetry
```

Examples requiring stronger justification before sharing:

```text
business decisions
feature validation
workflow orchestration
domain policy
use-case-specific transformation
```

The methodology MUST distinguish:

```text
same implementation shape
```

from:

```text
same semantic concept
```

Only the second strongly justifies shared domain abstraction.

---

## 8. Prefer duplication over premature coupling

Similar-looking code in multiple slices MUST NOT automatically be deduplicated.

Duplication MAY be preferable when independent copies can evolve independently.

Promote code into a shared abstraction only when there is evidence that the participating behaviors represent the same stable concept and change for the same reason.

Therefore:

```text
local duplication
```

may be safer than:

```text
global dependency
```

---

## 9. Abstractions MUST earn their existence

Every abstraction SHOULD perform at least one meaningful architectural function:

```text
express a domain concept
enforce a boundary
isolate real volatility
represent a policy
provide a genuine substitution point
remove demonstrated semantic duplication
```

Architectural symmetry alone MUST NOT justify an abstraction.

Examples that MUST NOT be mandatory merely by convention:

```text
interface for every class
repository for every persistence operation
service layer for every request
controller → service → repository chains
mapping layer for every model
```

Direct implementation is preferable when an abstraction has no demonstrated purpose.

---

## 10. Do not recreate horizontal architecture through shared services

A supposedly shared service MUST NOT become a hidden horizontal layer through which most behavioral slices are forced to pass.

Warning signs include:

```text
most slices depend on the same service
shared service frequently changes for unrelated features
shared service contains feature switches
understanding a feature requires tracing into large shared classes
shared service performs use-case orchestration
```

Shared infrastructure SHOULD remain mechanistic rather than becoming centralized feature decision-making.

---

## 11. Each slice MAY choose its simplest appropriate implementation

All slices MUST NOT be forced into identical internal architectures.

One slice may require:

```text
simple transaction script
```

while another may require:

```text
rich domain model
aggregate
state machine
specialized query
policy object
```

Implementation complexity SHOULD correspond to actual behavioral complexity.

---

## 12. Complexity must be earned locally

Start each behavioral unit with the simplest implementation that correctly represents its behavior.

Introduce stronger structures when evidence appears, such as:

```text
repeated invariants
repeated business decisions
deep conditional logic
large handlers
temporal coupling
primitive obsession
duplicated domain rules
concepts acquiring independent meaning
```

Do not prepay complexity across the entire application because some future feature might require it.

---

## 13. Refactoring is part of the architecture

Vertical locality MUST NOT become permission for large procedural dumping grounds.

Continuously inspect slices for signals that behavior should become an explicit domain concept.

Examples:

```text
long handlers
deep nesting
duplicated invariants
feature envy
repeated parameter groups
repeated state-transition logic
business rules spread through orchestration code
```

When a concept gains stable semantic meaning, extract it deliberately.

---

## 14. Commands and queries need not share an architecture

Reads and writes frequently have different requirements.

A query SHOULD optimize for:

```text
retrieval
projection
filtering
response shape
performance
```

A command SHOULD optimize for:

```text
state transition
invariants
authorization
business rules
consistency
```

Do not introduce command-side domain abstractions into queries merely for architectural symmetry.

Do not force queries and commands through identical persistence paths.

---

## 15. Separate feature decomposition from dependency policy

Behavioral slicing answers:

```text
What changes together?
```

Dependency architecture answers:

```text
What may depend on what?
```

These are separate dimensions.

Dependency-direction rules MAY coexist with behavioral slices, but dependency rules MUST NOT force every slice through unnecessary layers.

---

## 16. Every slice SHOULD expose a clear behavioral boundary

A slice SHOULD have an identifiable entry point through which its externally meaningful behavior is invoked.

Examples:

```text
HTTP endpoint
message handler
command handler
CLI command
scheduled job
public application operation
```

The boundary SHOULD make the behavior's input and observable output explicit.

---

## 17. Verify the behavior through its real boundary

Each significant slice SHOULD have at least one behavioral test exercising the actual public boundary.

Where applicable, this test SHOULD include:

```text
routing
deserialization
validation
authorization
behavior
persistence
serialization
response
```

The primary verification question is:

```text
Does the use case work?
```

rather than:

```text
Did class A call method B?
```

---

## 18. Prefer real collaborators in behavioral tests

Where practical, slice-level tests SHOULD exercise real system collaborators, particularly:

```text
database
routing
serialization
dependency configuration
transaction handling
```

Mocks SHOULD NOT replace collaborators merely to make architectural layers easier to unit test.

Behavioral tests SHOULD prove observable state transitions and outputs, not only interaction patterns between classes.

---

## 19. Unit tests follow meaningful domain extraction

Isolated unit tests SHOULD be introduced when a meaningful domain concept or nontrivial decision structure has been extracted.

Expected progression:

```text
simple slice
    →
behavioral boundary test
    →
domain complexity emerges
    →
extract domain concept
    →
focused unit tests for domain concept
    +
retain behavioral boundary test
```

Do not invent service classes solely to create unit-test seams.

---

## 20. Shared-code modification is high-risk

A local feature requiring modification to shared infrastructure MUST trigger expanded reasoning.

Before modifying shared code, determine:

```text
Why is this change genuinely shared?

Which behavioral units consume this code?

Would local implementation preserve independence better?

Was the abstraction generalized prematurely?

What regression surface does the shared change create?
```

The implementation process SHOULD distinguish an ordinary local edit from a shared architectural edit.

---

## 21. Agent context SHOULD follow behavioral boundaries

An implementation agent SHOULD receive the smallest context sufficient to implement the behavior safely.

Initial context SHOULD normally include:

```text
requested behavior
owning slice
relevant domain concepts
direct dependencies
behavioral tests
applicable architectural constraints
```

Repository-wide context SHOULD NOT be required for a slice-local modification.

Additional context SHOULD be pulled only when dependency analysis demonstrates that it is necessary.

---

## 22. Unexpected scope expansion MUST trigger reassessment

If an apparently local change requires:

```text
multiple unrelated slices
shared framework components
large common services
unrelated tests
repository-wide modifications
```

the agent SHOULD reassess the design before continuing normally.

Unexpected scope expansion may indicate:

```text
incorrect ownership
hidden coupling
premature abstraction
missing domain boundary
cross-cutting concern incorrectly modeled
architectural degradation
```

---

## 23. Architecture SHOULD constrain incorrect changes

Architectural boundaries should not exist merely for organization.

They SHOULD limit the consequences of mistakes.

A defect introduced while modifying one behavioral unit SHOULD normally remain within that unit or its explicitly declared dependencies.

Architecture therefore acts as a containment mechanism.

---

## 24. Measure blast radius

Quality assessment SHOULD consider not merely whether defects occur, but how far their effects propagate.

For each regression, observe:

```text
originating slice
affected slices
shared components involved
unrelated behaviors affected
recovery work required
```

Desired property:

```text
unrelated_slices_affected → 0
```

---

## 25. Measure change locality

Track how much of each feature change remains inside its expected behavioral boundary.

Example:

```text
change_locality =
    files_changed_inside_owning_slice
    ---------------------------------
    total_files_changed
```

For a normal feature change:

```text
change_locality → 1.0
```

Low locality SHOULD trigger architectural investigation.

---

## 26. Measure cross-slice change frequency

Track:

```text
cross_slice_change_rate =
    feature_changes_touching_multiple_slices
    ----------------------------------------
    total_feature_changes
```

A rising value may indicate:

```text
hidden coupling
poor ownership
weak boundaries
over-generalized abstractions
```

---

## 27. Measure shared-code change frequency

Track:

```text
shared_change_rate =
    feature_changes_modifying_shared_code
    -------------------------------------
    total_feature_changes
```

Frequent shared modification SHOULD be investigated.

Shared code that changes for many unrelated reasons is likely an unstable coupling point.

---

## 28. Measure behavioral boundary coverage

Track:

```text
boundary_coverage =
    slices_with_behavioral_boundary_tests
    -------------------------------------
    total_significant_slices
```

Desired direction:

```text
boundary_coverage → 1.0
```

This metric is distinct from line coverage.

It asks whether the architecture's behavioral units are actually verified as behavioral units.

---

## 29. Measure cognitive scope

For a typical feature change, observe:

```text
files required
modules required
domain concepts required
dependencies traversed
architectural boundaries crossed
```

A well-localized behavior SHOULD require a small and predictable reasoning set.

---

## 30. Measure agent context locality

For agent-assisted development, track:

```text
context_locality =
    relevant_behavior_tokens
    ------------------------
    total_context_tokens
```

Higher context locality is desirable.

Large amounts of unrelated repository context increase reasoning cost and opportunity for unintended modification.

---

## 31. Measure architectural boundary violations

Automated tooling SHOULD detect changes such as:

```text
slice A importing internals of slice B
feature-specific logic entering shared infrastructure
unexpected dependency direction
local feature editing unrelated feature
new dependency on broad shared service
```

Boundary violations SHOULD be visible during planning, implementation, or validation rather than discovered only through regression.

---

## 32. Measure structural complexity where it predicts change difficulty

Observe:

```text
cyclomatic complexity
branch count
nesting depth
dependency count
fan-in
fan-out
handler size
```

These metrics are signals, not goals by themselves.

Their purpose is to identify behavioral units whose implementation has become difficult to reason about or verify.

---

## 33. Prefer architecture metrics over productivity proxies

Do not evaluate architecture primarily using:

```text
story points
developer output
commit count
raw velocity
lines of code
```

Prefer measurements directly connected to system structure and response to change:

```text
change locality
blast radius
cross-slice changes
shared-code changes
boundary violations
behavioral test coverage
mutation effectiveness
dependency growth
recovery cost
```

---

## 34. Measure the system's response to change

Architecture SHOULD ultimately be evaluated by what happens when requirements change.

Observe:

```text
How much code changed?

How many behavioral units changed?

How many dependencies were traversed?

Did shared code need modification?

Did unrelated behavior regress?

How much context was needed?

How much recovery work followed?
```

A good architecture causes ordinary changes to remain ordinary.

---

## 35. Tests SHOULD constrain behavior, not merely execute code

Test quality SHOULD be evaluated partly by whether tests detect meaningful behavioral modifications.

Mutation testing MAY be used to determine whether important behavioral changes survive unnoticed.

High execution coverage without behavioral sensitivity MUST NOT be treated as strong verification.

---

## 36. Repository structure SHOULD be legible to humans and agents

Names and directories SHOULD expose:

```text
capabilities
use cases
domain concepts
ownership
public boundaries
tests
```

An unfamiliar engineer or agent SHOULD be able to infer where a requested behavior lives without reconstructing the architecture from framework conventions.

---

## 37. Similar slices SHOULD have predictable shapes

Comparable behaviors SHOULD use enough structural consistency that learning one slice helps navigate another.

Consistency SHOULD improve discovery.

Consistency MUST NOT require identical internal implementations where the behaviors have different needs.

Therefore:

```text
consistent outer shape
+
locally appropriate inner implementation
```

is preferable to global architectural uniformity.

---

## 38. Scope drift SHOULD be detectable

For each requested change, compare:

```text
declared behavior
expected owning slice
planned files
actual files
actual dependencies
actual behavioral effects
```

Changes outside the expected scope SHOULD require explanation.

The implementation system SHOULD make scope drift visible.

---

## 39. Plans SHOULD declare expected boundaries before implementation

Before implementation, an agent SHOULD identify:

```text
requested behavior
owning slice
expected files or components
relevant domain rules
public boundary
expected tests
anticipated shared dependencies
```

This declared scope becomes a basis for detecting unexpected expansion during implementation.

---

## 40. Verification SHOULD compare planned and actual impact

After implementation, compare:

```text
expected change surface
vs.
actual change surface
```

Investigate:

```text
unexpected files
unexpected slices
new shared dependencies
new abstractions
new boundary crossings
unexpected test failures
```

Successful behavior alone SHOULD NOT automatically validate an unexpectedly broad implementation.

---

# Agent Implementation Protocol

For each requested software change:

```text
1. Identify the externally meaningful behavior.

2. Identify its owning slice.

3. Identify the slice's public boundary.

4. Identify applicable domain rules and invariants.

5. Declare the expected change surface.

6. Load the smallest sufficient implementation context.

7. Implement inside the owning slice.

8. Prefer additive local code over modification of shared code.

9. If shared code must change:
       classify the reason;
       identify consumers;
       assess blast radius;
       reconsider local alternatives.

10. Do not generalize duplicated code without semantic evidence.

11. Introduce abstractions only when they enforce a real concept or boundary.

12. Keep feature-specific decisions out of shared infrastructure.

13. Test the behavior through its public boundary.

14. Use real persistence and infrastructure where practical.

15. Extract and unit-test domain concepts when genuine complexity emerges.

16. Detect cross-slice dependencies and unexpected files.

17. Compare actual change scope with declared scope.

18. Treat unexplained boundary crossings as architectural findings.

19. Run broader verification proportional to the actual blast radius.

20. Record locality, boundary, and regression observations for architectural analysis.
```

# Core invariants

The methodology should attempt to preserve these invariants:

```text
one meaningful use case
    ≈
one identifiable owning slice
```

```text
ordinary behavior change
    ≈
local slice change
```

```text
new behavior
    ≈
additive slice growth
```

```text
feature-specific decision
    →
feature/domain ownership
```

```text
shared infrastructure
    →
shared mechanism
    ≠
shared feature decision-making
```

```text
behavior verification
    →
public boundary
    →
real observable effect
```

```text
unexpected boundary crossing
    →
explicit architectural analysis
```

# Governing principle

The strongest combined principle is:

> **A use case is the primary unit of architecture, implementation, change, context, and verification. Feature-specific decisions should remain within that boundary, ordinary changes should remain local to it, and every crossing of that boundary should be explicit, justified, testable, and measurable.**

A shorter operational form is:

> **Local behavior. Local context. Local change. Local verification. Explicit crossings.**

# Relationship to an existing strict methodology

When integrating BBCE with an existing methodology, do not weaken existing constraints merely to conform to Vertical Slice Architecture.

Instead, determine for every BBCE feature whether the existing methodology:

```text
already guarantees it
provides a stronger guarantee
can adopt it directly
can derive it from an existing invariant
needs a new enforcement mechanism
conflicts with it
```

Where both methodologies address the same concern, prefer the rule that produces the more explicit, mechanically verifiable constraint.

The desired result is not architectural stylistic conformity.

The desired result is a development system in which **the intended unit of change is known before implementation, preserved during implementation, verified after implementation, and measurable over the lifetime of the codebase.**

