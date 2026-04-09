// Package executor runs the Cursor `agent` CLI and parses stream-json output.
// REQ: REQ-GOAGENT-EXECUTOR, REQ-ATDD-E2E-AGENT_STREAM
// ARCH: ARCH-GOAGENT-EXECUTOR, ARCH-ATDD-E2E_SUBPROCESS_STREAM_JSON
// IMPL: IMPL-GOAGENT-EXECUTOR, IMPL-ATDD-E2E-AGENT_STREAM
package executor

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
	"strings"

	"stdd/agentstream"
)

// AgentArgv builds argv for one agent invocation (argv[0] is the agent binary). REQ-GOAGENT-EXECUTOR.
func AgentArgv(agentPath, workspace, model, resumeID string, parts []string) []string {
	if agentPath == "" {
		agentPath = "agent"
	}
	if model == "" {
		model = "Auto"
	}
	cmd := []string{
		agentPath, "--print", "--output-format", "stream-json",
		"--model", model,
		"--trust", "--force",
	}
	if workspace != "" {
		cmd = append(cmd, "--workspace", workspace)
	}
	if resumeID != "" {
		cmd = append(cmd, "--resume", resumeID)
	}
	cmd = append(cmd, parts...)
	return cmd
}

// Run executes agent with argv, streams text to out, forwards stderr, returns session ID and exit code. REQ-GOAGENT-EXECUTOR.
func Run(ctx context.Context, argv []string, out io.Writer, errOut io.Writer) (agentstream.SessionID, int, error) {
	cmd := exec.CommandContext(ctx, argv[0], argv[1:]...)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return "", -1, err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return "", -1, err
	}
	if err := cmd.Start(); err != nil {
		return "", -1, err
	}

	errDone := make(chan struct{})
	go func() {
		defer close(errDone)
		s := bufio.NewScanner(stderr)
		for s.Scan() {
			_, _ = fmt.Fprintln(errOut, s.Text())
		}
	}()

	var captured agentstream.SessionID
	sc := bufio.NewScanner(stdout)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		var obj map[string]interface{}
		if err := json.Unmarshal([]byte(line), &obj); err != nil {
			_, _ = fmt.Fprintf(errOut, "JSON parse error: %v\n", err)
			continue
		}
		if sid, ok := obj["session_id"].(string); ok && sid != "" {
			captured = agentstream.SessionID(sid)
		}
		for _, f := range extractTextFragments(obj) {
			_, _ = out.Write([]byte(f))
		}
		if typ, _ := obj["type"].(string); typ == "thinking" {
			if sub, _ := obj["subtype"].(string); sub == "completed" {
				_, _ = out.Write([]byte("\n"))
			}
		}
	}
	<-errDone
	waitErr := cmd.Wait()
	exit := 0
	if waitErr != nil {
		exit = 1
		if ee, ok := waitErr.(*exec.ExitError); ok {
			exit = ee.ExitCode()
		}
		_, _ = fmt.Fprintf(errOut, "agent exited with status %d\n", exit)
		return captured, exit, waitErr
	}
	return captured, exit, nil
}

func extractTextFragments(obj map[string]interface{}) []string {
	var frags []string
	typ, _ := obj["type"].(string)
	switch typ {
	case "thinking":
		if sub, _ := obj["subtype"].(string); sub == "delta" {
			if t, ok := obj["text"].(string); ok && t != "" {
				frags = append(frags, t)
			}
		}
	case "assistant":
		msg, ok := obj["message"].(map[string]interface{})
		if !ok {
			return frags
		}
		parts, ok := msg["content"].([]interface{})
		if !ok {
			return frags
		}
		for _, p := range parts {
			pm, ok := p.(map[string]interface{})
			if !ok {
				continue
			}
			if pt, _ := pm["type"].(string); pt == "text" {
				if t, ok := pm["text"].(string); ok && t != "" {
					frags = append(frags, t)
				}
			}
		}
	}
	return frags
}
