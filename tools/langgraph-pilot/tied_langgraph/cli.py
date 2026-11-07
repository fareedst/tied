"""CLI entry for checklist segment and multi-task runs — [PLAN-TIED-LG-P5/P6]."""

from __future__ import annotations

import argparse
from pathlib import Path

from tied_langgraph.checklist_segment import resolve_segment
from tied_langgraph.graphs.project import run_checklist_segment
from tied_langgraph.graphs.project_multi import run_multi_task_plan


def _segment_command(argv: list[str] | None) -> int:
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


def _multi_task_command(argv: list[str] | None) -> int:
    parser = argparse.ArgumentParser(description="LangGraph pilot multi-task DAG runner")
    parser.add_argument("--task-plan", type=Path, required=True)
    parser.add_argument("--tracker-alpha", type=Path, required=True)
    parser.add_argument("--tracker-beta", type=Path, required=True)
    parser.add_argument("--run-directory", type=Path, required=True)
    parser.add_argument("--request-token", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--candidate-commit", default="local")
    parser.add_argument("--max-parallel", type=int, default=2)
    args = parser.parse_args(argv)

    run_multi_task_plan(
        task_plan_path=args.task_plan,
        run_directory=args.run_directory,
        tracker_paths={
            "task-alpha": args.tracker_alpha,
            "task-beta": args.tracker_beta,
        },
        request_token=args.request_token,
        run_id=args.run_id,
        candidate_commit=args.candidate_commit,
        evidence_refs={},
        max_parallel=args.max_parallel,
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    argv = list(argv or [])
    if not argv or argv[0] in ("-h", "--help"):
        parser = argparse.ArgumentParser(description="LangGraph pilot CLI")
        parser.add_argument("command", nargs="?", choices=["segment", "multi-task"], default="segment")
        parser.print_help()
        return 0
    command = argv[0]
    rest = argv[1:]
    if command == "multi-task":
        return _multi_task_command(rest)
    if command == "segment":
        return _segment_command(rest)
    return _segment_command(argv)


if __name__ == "__main__":
    raise SystemExit(main())
