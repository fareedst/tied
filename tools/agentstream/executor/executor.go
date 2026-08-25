// Package executor runs the Cursor `agent` CLI and parses stream-json output.
// [IMPL-GOAGENT-EXECUTOR] [ARCH-GOAGENT-EXECUTOR] [REQ-GOAGENT-AGENT-EXECUTOR]
// How: AgentArgv builds resume-capable argv; Run stream-parses JSON stdout for session_id and assistant text.
package executor

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	"stdd/agentstream"
)

// RunResult separates final assistant text from thinking for receipt binding.
// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
type RunResult struct {
	SessionID    agentstream.SessionID
	FinalText    string
	ThinkingText string
	Transcript   string
}

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

// Run executes agent with argv, streams text to out, forwards stderr, and
// returns RunResult, exit code, and error. Optional extraEnv entries are appended to os.Environ().
func Run(ctx context.Context, argv []string, out io.Writer, errOut io.Writer, extraEnv ...string) (RunResult, int, error) {
	cmd := exec.CommandContext(ctx, argv[0], argv[1:]...)
	if len(extraEnv) > 0 {
		cmd.Env = append(os.Environ(), extraEnv...)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return RunResult{}, -1, err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return RunResult{}, -1, err
	}
	if err := cmd.Start(); err != nil {
		return RunResult{}, -1, err
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
	var finalText, thinkingText, transcript strings.Builder
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
			typ, _ := obj["type"].(string)
			if typ == "thinking" {
				thinkingText.WriteString(f)
			} else {
				finalText.WriteString(f)
			}
			_, _ = out.Write([]byte(f))
			transcript.WriteString(f)
		}
		if typ, _ := obj["type"].(string); typ == "thinking" {
			if sub, _ := obj["subtype"].(string); sub == "completed" {
				_, _ = out.Write([]byte("\n"))
				transcript.WriteByte('\n')
			}
		}
	}
	<-errDone
	waitErr := cmd.Wait()
	exit := 0
	result := RunResult{
		SessionID:    captured,
		FinalText:    finalText.String(),
		ThinkingText: thinkingText.String(),
		Transcript:   transcript.String(),
	}
	if waitErr != nil {
		exit = 1
		if ee, ok := waitErr.(*exec.ExitError); ok {
			exit = ee.ExitCode()
		}
		_, _ = fmt.Fprintf(errOut, "agent exited with status %d\n", exit)
		return result, exit, waitErr
	}
	return result, exit, nil
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
