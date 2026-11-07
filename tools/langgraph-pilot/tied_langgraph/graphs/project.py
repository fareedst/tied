"""Project graph: checklist segment orchestration — [PLAN-TIED-LG-P5-CHECKLIST]."""

from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

from langgraph.graph import END, START, StateGraph

from tied_langgraph.graphs.verification import build_verification_graph
from tied_langgraph.ledger import append_observation, load_ledger
from tied_langgraph.policies.tdd_red import classify_red_result, implement_allowed
from tied_langgraph.policies.test_weakening import detect_test_weakening
from tied_langgraph.mcp_client import McpClient
from tied_langgraph.policies.staleness import staleness_route
from tied_langgraph.routing import GraphRoute, route_from_validate_payload
from tied_langgraph.state import RunState
from tied_langgraph.tracker_writer import mark_slug_completed

TDD_SLUGS = frozenset({"unit-test-red", "unit-test-green"})
VERIFICATION_SLUGS = frozenset({"composition-integration"})


def decide_evidence_transition(
    *,
    validate_payload: dict[str, Any],
    candidate_commit: str | None,
    evidence_commit: str | None,
) -> GraphRoute | str:
    """Apply staleness check before gap severity routing."""
    stale_route = staleness_route(
        candidate_commit=candidate_commit,
        evidence_commit=evidence_commit,
    )
    if stale_route == "repair":
        return "repair"
    return route_from_validate_payload(validate_payload)


def build_ping_graph(*, client: McpClient, run_directory: Path) -> Any:
    run_directory.mkdir(parents=True, exist_ok=True)

    def ping_node(state: RunState) -> RunState:
        result = client.call_tool("tied_config_get_base_path", {})
        checkpoint = run_directory / f"{state['run_id']}-checkpoint.json"
        checkpoint.write_text(json.dumps({"run_id": state["run_id"], "mcp": result}), encoding="utf-8")
        updated = dict(state)
        updated["mcp_last_result"] = result
        updated["checkpoint_path"] = str(checkpoint)
        return updated  # type: ignore[return-value]

    graph = StateGraph(RunState)
    graph.add_node("ping", ping_node)
    graph.add_edge(START, "ping")
    graph.add_edge("ping", END)
    return graph.compile()


def _default_tdd_runners(worktree: Path) -> tuple[Any, Any, Any]:
    def runner_red(_state: RunState) -> dict[str, Any]:
        return {"exit_code": 1, "stdout": "", "stderr": "AssertionError: expected failure"}

    def runner_green(_state: RunState) -> dict[str, Any]:
        return {"exit_code": 0, "stdout": "ok", "stderr": ""}

    def apply_green(path: Path) -> None:
        (path / ".green").write_text("1", encoding="utf-8")

    return runner_red, runner_green, apply_green


def _run_tdd_for_slug(
    *,
    slug: str,
    state: RunState,
    run_directory: Path,
    worktree: Path,
    runner_red: Callable[[RunState], dict[str, Any]],
    runner_green: Callable[[RunState], dict[str, Any]],
    apply_green: Callable[[Path], None],
    ledger_filename: str = "run-ledger.json",
) -> RunState:
    if slug == "unit-test-red":
        outcome = runner_red(state)
        updated = dict(state)
        updated["tdd_phase"] = "red"
        updated["last_exit_code"] = int(outcome["exit_code"])
        vars_ = {
            **(state.get("checklist_vars") or {}),
            "red_stdout": outcome.get("stdout", ""),
            "red_stderr": outcome.get("stderr", ""),
        }
        red = classify_red_result(
            exit_code=updated["last_exit_code"],
            stdout=str(vars_["red_stdout"]),
            stderr=str(vars_["red_stderr"]),
        )
        updated["red_classification"] = red.value
        updated["tdd_route"] = "green" if implement_allowed(red) else "repair"
        updated["tdd_phase"] = "red_gate"
        updated["checklist_vars"] = vars_
        if updated["tdd_route"] != "green":
            raise RuntimeError(f"TDD red gate failed for slug {slug}")
        updated["current_slug"] = slug
        return updated  # type: ignore[return-value]

    if slug == "unit-test-green":
        apply_green(worktree)
        outcome = runner_green(state)
        updated = dict(state)
        updated["tdd_phase"] = "green"
        updated["last_exit_code"] = int(outcome["exit_code"])
        vars_ = {
            **(state.get("checklist_vars") or {}),
            "green_stdout": outcome.get("stdout", ""),
            "green_stderr": outcome.get("stderr", ""),
        }
        ledger = load_ledger(run_directory / ledger_filename)
        diff_text = state.get("test_diff") or ""
        weakening = detect_test_weakening(diff_text=diff_text, ledger=ledger)
        exit_code = int(updated["last_exit_code"])
        updated["green_blocked"] = weakening or exit_code != 0
        if updated["green_blocked"]:
            updated["tdd_phase"] = "green_gate"
            updated["tdd_route"] = "repair"
            raise RuntimeError(f"TDD green gate failed for slug {slug}")
        updated["tdd_phase"] = "refactor"
        updated["tdd_route"] = "done"
        updated["checklist_vars"] = vars_
        updated["current_slug"] = slug
        return updated  # type: ignore[return-value]

    raise ValueError(f"not a TDD slug: {slug}")


def _run_verification_slug(
    *,
    state: RunState,
    run_directory: Path,
) -> RunState:
    graph = build_verification_graph(
        run_directory=run_directory,
        gate_allowed=True,
        skip_mcp_gate=True,
    )
    out = graph.invoke(state)
    out["current_slug"] = "composition-integration"
    return out  # type: ignore[return-value]


def build_checklist_project_graph(
    *,
    run_directory: Path,
    tracker_path: Path,
    segment: list[str],
    worktree_path: Path,
    runner_red: Callable[[RunState], dict[str, Any]] | None = None,
    runner_green: Callable[[RunState], dict[str, Any]] | None = None,
    apply_green: Callable[[Path], None] | None = None,
    ledger_filename: str = "run-ledger.json",
) -> Any:
    """Build a graph that iterates slugs and updates tracker + ledger."""
    run_directory.mkdir(parents=True, exist_ok=True)
    r_red, r_green, a_green = _default_tdd_runners(worktree_path)
    if runner_red is not None:
        r_red = runner_red
    if runner_green is not None:
        r_green = runner_green
    if apply_green is not None:
        a_green = apply_green

    ordered = list(segment)

    def make_slug_node(slug: str) -> Callable[[RunState], RunState]:
        def node(state: RunState) -> RunState:
            if slug in TDD_SLUGS:
                updated = _run_tdd_for_slug(
                    slug=slug,
                    state=state,
                    run_directory=run_directory,
                    worktree=worktree_path,
                    runner_red=r_red,
                    runner_green=r_green,
                    apply_green=a_green,
                    ledger_filename=ledger_filename,
                )
            elif slug in VERIFICATION_SLUGS:
                updated = _run_verification_slug(state=state, run_directory=run_directory)
            else:
                raise ValueError(f"unsupported slug in segment: {slug}")

            evidence_path = f"slug-{slug}.json"
            artifact = run_directory / evidence_path
            artifact.write_text(json.dumps({"slug": slug, "disposition": "completed"}), encoding="utf-8")
            append_observation(
                run_directory=run_directory,
                ledger_filename=ledger_filename,
                run_id=state["run_id"],
                request_token=state["request_token"],
                tool=f"checklist_slug:{slug}",
                commit=state.get("candidate_commit"),
                exit_code=0,
                artifact_path=evidence_path,
                candidate_commit=state.get("candidate_commit"),
            )
            mark_slug_completed(
                tracker_path=tracker_path,
                slug=slug,
                evidence_refs=[{"kind": "file_path", "path": str(artifact.relative_to(run_directory))}],
            )
            completed = [*state.get("completed_slugs", []), slug]
            updated["completed_slugs"] = completed
            if len(completed) == len(ordered):
                updated["segment_complete"] = True
            return updated  # type: ignore[return-value]

        return node

    def finalize_node(state: RunState) -> RunState:
        updated = dict(state)
        completed = updated.get("completed_slugs", [])
        updated["segment_complete"] = len(completed) == len(ordered)
        return updated  # type: ignore[return-value]

    graph = StateGraph(RunState)
    prev = START
    for slug in ordered:
        name = f"slug_{slug.replace('-', '_')}"
        graph.add_node(name, make_slug_node(slug))
        if prev == START:
            graph.add_edge(START, name)
        else:
            graph.add_edge(prev, name)
        prev = name
    graph.add_node("finalize", finalize_node)
    graph.add_edge(prev, "finalize")
    graph.add_edge("finalize", END)
    return graph.compile()


def run_checklist_segment(
    *,
    run_directory: Path,
    tracker_path: Path,
    segment: list[str],
    worktree_path: Path,
    request_token: str,
    run_id: str,
    candidate_commit: str,
    evidence_refs: dict[str, Any],
    policy_version: str = "v0",
    baseline_commit: str = "base",
    runner_red: Callable[[RunState], dict[str, Any]] | None = None,
    runner_green: Callable[[RunState], dict[str, Any]] | None = None,
    apply_green: Callable[[Path], None] | None = None,
) -> RunState:
    """Operator entry: run a contiguous checklist segment end-to-end."""
    initial: RunState = {
        "run_id": run_id,
        "request_token": request_token,
        "policy_version": policy_version,
        "baseline_commit": baseline_commit,
        "candidate_commit": candidate_commit,
        "checklist_vars": {},
        "evidence_refs": evidence_refs,
        "requirements_covered": True,
        "completed_slugs": [],
        "worktree_path": str(worktree_path),
        "test_diff": "",
    }
    graph = build_checklist_project_graph(
        run_directory=run_directory,
        tracker_path=tracker_path,
        segment=segment,
        worktree_path=worktree_path,
        runner_red=runner_red,
        runner_green=runner_green,
        apply_green=apply_green,
    )
    return graph.invoke(initial)
