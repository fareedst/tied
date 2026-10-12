"""Stdio-style MCP JSON-RPC client with optional read-only tool allowlist."""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import Any

READ_ONLY_SCAFFOLD_TOOLS = frozenset(
    {
        "tied_config_get_base_path",
        "yaml_index_read",
        "tied_validate_consistency",
    }
)


class McpTransport(ABC):
    @abstractmethod
    def request(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Send one JSON-RPC request and return the result object."""


class McpClient:
    def __init__(
        self,
        transport: McpTransport,
        *,
        read_only: bool = False,
        allowlist: frozenset[str] | None = READ_ONLY_SCAFFOLD_TOOLS,
    ) -> None:
        self._transport = transport
        self._read_only = read_only
        self._allowlist = allowlist
        self._initialized = False

    def _ensure_initialized(self) -> None:
        if self._initialized:
            return
        self._transport.request("initialize", {})
        # Notification — transports may no-op; no result expected.
        try:
            self._transport.request("notifications/initialized", {})
        except NotImplementedError:
            pass
        self._initialized = True

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        if self._read_only and self._allowlist is not None and name not in self._allowlist:
            raise ValueError(f"tool {name!r} is not in read-only allowlist")
        self._ensure_initialized()
        raw = self._transport.request(
            "tools/call",
            {"name": name, "arguments": arguments},
        )
        content = raw.get("content") or []
        if not content:
            return raw
        text = content[0].get("text")
        if isinstance(text, str):
            try:
                parsed = json.loads(text)
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                pass
        return raw
