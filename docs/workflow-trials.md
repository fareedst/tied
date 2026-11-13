

HARNESS=cursor MODEL_CONFIG=luna-high MODEL_SLUG=gpt-5.6-luna-high-fast workflow_trial_agentstream wf-01

HARNESS=cursor MODEL_CONFIG=luna-low MODEL_SLUG=gpt-5.6-luna-low-fast workflow_trial_agentstream wf-01

HARNESS=cursor MODEL_CONFIG=luna-med MODEL_SLUG=gpt-5.6-luna-medium-fast workflow_trial_agentstream wf-05

AGENTSTREAM_CLAUDE_LIVE_OK=1 HARNESS=claude MODEL_CONFIG=haiku-5-5 MODEL_SLUG=claude-haiku-5-5 workflow_trial_agentstream wf-08

AGENTSTREAM_CLAUDE_LIVE_OK=1 HARNESS=claude MODEL_CONFIG=sonnet-5-5 MODEL_SLUG=claude-sonnet-5-5 workflow_trial_agentstream wf-08

@record-wf-trial

workflow_trial_range claude claude-haiku-5-5 haiku55 8
workflow_trial_range claude claude-sonnet-5-5 sonnet55 8
workflow_trial_range cursor composer-2.5-fast composer25 8
workflow_trial_range cursor gpt-5.6-luna-high-fast gpt56luna-high 8
workflow_trial_range cursor gpt-5.6-luna-low-fast gpt56luna-low 8
workflow_trial_range cursor grok-4.7-medium-fast grok47-med 8


AGENTSTREAM_CLAUDE_LIVE_OK=1 \
HARNESS=claude \
MODEL_CONFIG=haiku-5-5 \
MODEL_SLUG=claude-haiku-5-5 \
workflow_trial_agentstream wf-05

AGENTSTREAM_CLAUDE_LIVE_OK=1 \
HARNESS=claude \
MODEL_CONFIG=sonnet-5-5 \
MODEL_SLUG=claude-sonnet-5-5 \
workflow_trial_agentstream wf-05

workflow_trial_range [harness] [model_slug] [model_config] [effort] [end] [start]
workflow_trial_range claude claude-haiku-5-5 haiku-5-5 medium 1
workflow_trial_range cursor composer-2.5 composer25 medium 1

export ECHO_EXEC=:
source scripts/build-commands.sh
workflow_trial_range cursor gpt-5.6-luna-low-fast luna-low medium 2 2
workflow_trial_range claude claude-haiku-5-5 haiku-5-5 medium 2 2

source scripts/build-commands.sh
workflow_trial_range cursor composer-2.5 medium 10 10
echo_exec workflow_trial_range cursor cursor-grok-4.6 low 10 10
echo_exec workflow_trial_range cursor grok-4.7 low 10 10
workflow_trial_range claude fable-5-2 low 10 10 # limited
workflow_trial_range claude haiku-5-5 high 8
workflow_trial_range claude sonnet-5-5 high 8
echo_exec workflow_trial_range claude sonnet-4-6 low 10 10

$ agent models | grep grok | sort

node tools/bootstrap/lib/project-size-batch-compare.mjs \
  --store-root "$PWD" --pattern wf-agentstream  \
  --out-dir tied-project/non-tied-plans/project-size-batch-discover-compare/evidence \
  --dry-run

node tools/bootstrap/lib/project-size-batch-compare.mjs \
  --store-root "$PWD" \
  --pattern wf-agentstream \
  --fine-labels \
  --include-store \
  --include-trial-factors \
  --verbose-table \
  --out-dir tied-project/non-tied-plans/project-size-batch-discover-compare/evidence

# Facilitator cohort summary: tied-project/non-tied-plans/project-size-batch-discover-compare/evidence/comparison-table.md
# (## Summary — wall_clock column is whole minutes). See docs/demos/catalog-tied-size-and-trial-statistics.md.

# effort: Basic Considered Deep