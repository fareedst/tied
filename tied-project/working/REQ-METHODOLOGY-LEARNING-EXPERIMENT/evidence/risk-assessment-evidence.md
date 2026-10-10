# risk-assessment — REQ-METHODOLOGY-LEARNING-EXPERIMENT

**depth_tier:** integrated (persistence + MCP)

**Triggers:** persistence to `methodology-experiments.yaml`, new MCP write tools.

**Risks:** RISK-MLE-001 schema drift vs child plan — mitigated by shared constants and example fixture.

**Hinges:** storage_shape compose_existing_stores (file under tied-project); no tied-bundle edit.
