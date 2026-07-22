---
name: adr
description: Generate Architecture Decision Records (ADRs). Trigger when user wants to create an ADR for architectural decisions like technology selection, system design, sync strategies, or API design. Create ADRs by asking targeted questions about the decision's context, alternatives considered, and consequences, then generate structured markdown.
---

# ADR Generator

Interview the user to gather decision context, then generate a structured ADR.

## Process

Ask questions iteratively to gather:

- **Problem**: What issue triggered this decision?
- **Decision**: What was chosen and why?
- **Alternatives**: What other options existed? Why rejected?
- **Consequences**: Benefits and drawbacks
- **Timeline**: When was it decided?
- **Impact**: What systems/teams affected?

Tailor questions to decision type:

- **Tech selection**: performance, team skills, scaling, lock-in
- **Architecture**: offline support, conflict resolution, consistency
- **Process**: compliance, exceptions, audit trail

## ADR Template

```markdown
# ADR-NNN: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-NNN]

## Context

Problem, constraints, and why this decision was needed.

## Decision

What was decided and why this option was chosen.

## Consequences

### Positive

- Benefit 1
- Benefit 2

### Negative

- Drawback 1
- Drawback 2

### Risks

- Risk 1
- Risk 2

## Alternatives Considered

### Alternative 1: [Name]

Pros: ...
Cons: ...
Why not: ...

### Alternative 2: [Name]

Pros: ...
Cons: ...
Why not: ...

## Implementation

- Step 1
- Step 2
- Testing approach
- Monitoring plan

## Related ADRs

- ADR-NNN: [Related decision]

---

**Author:** @[user]  
**Date:** YYYY-MM-DD
```

## Refinement

After generating, ask if user wants changes:

- Add/remove sections
- Expand specific parts
- Clarify technical details
- Output ready for copy-paste to `docs/adr/NNNN-title.md`

## Status Values

- **Proposed**: Under review
- **Accepted**: Approved, in use
- **Deprecated**: No longer valid
- **Superseded by ADR-NNN**: Replaced by newer decision
