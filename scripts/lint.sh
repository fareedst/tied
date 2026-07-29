echo_exec ./scripts/lint_yaml.sh -F tied && \
echo_exec ./scripts/yaml_tool.sh --sort-lists --sort-keys -F tied && \
TIED_MCP_BIN=./mcp-server/dist/index.js echo_exec ./tools/bundled-tied-yaml-skill/scripts/tied-cli.sh tied_verify