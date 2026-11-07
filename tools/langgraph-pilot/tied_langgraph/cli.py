"""CLI entry for checklist segment runs — [PLAN-TIED-LG-P5-CHECKLIST]."""

from __future__ import annotations

import argparse
from pathlib import Path

from tied_langgraph.checklist_segment import resolve_segment
from tied_langgraph.graphs.project import run_checklist_segment


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="LangGraph pilot checklist segment runner")
    parser.add_argument("--checklist-yaml", type=Path, help="Master checklist YAML path")
    parser.add_argument("--tracker", type=Path, required=True, help="Disposable tracker YAML path")
    parser.add_argument("--segment", default="tdd-unit-slice", help="Preset name or comma-separated slugs")
    parser.add_argument("--run-directory", type=Path, required=True)
    parser.add_argument("--worktree", type=Path, required=True)
    parser.add_argument("--request-token", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--candidate-commit", default="local")
    args = parser.parse_args(argv)

    if "," in args.segment:
        slugs = [s.strip() for s in args.segment.split(",") if s.strip()]
        segment = resolve_segment(checklist_yaml=args.checklist_yaml, slugs=slugs)
    else:
        segment = resolve_segment(checklist_yaml=args.checklist_yaml, preset=args.segment)

    run_checklist_segment(
        run_directory=args.run_directory,
        tracker_path=args.tracker,
        segment=segment,
        worktree_path=args.worktree,
        request_token=args.request_token,
        run_id=args.run_id,
        candidate_commit=args.candidate_commit,
        evidence_refs={},
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
