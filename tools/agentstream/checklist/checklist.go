// Package checklist renders agent-req-implementation-checklist-style YAML into Turns.
// REQ: REQ-GOAGENT-YAML-STEPS, REQ-GOAGENT-YAML-STEP-RENDER, PROC-AGENT_REQ_CHECKLIST
// ARCH: ARCH-GOAGENT-YAML-CHECKLIST
// IMPL: IMPL-GOAGENT-CHECKLIST
package checklist

import (
	"fmt"
	"os"
	"strings"

	"stdd/agentstream"

	"gopkg.in/yaml.v3"
)

// Options configures checklist expansion. REQ-GOAGENT-YAML-STEPS.
type Options struct {
	IncludeSubProcedures bool
	// StepFromID and StepToID are optional inclusive bounds on main steps only (YAML order).
	// Empty string means unbounded on that side. REQ-GOAGENT-YAML-STEP-RENDER.
	StepFromID string
	StepToID   string
}

type yamlDoc struct {
	Steps          []yamlStep `yaml:"steps"`
	SubProcedures  []yamlSub  `yaml:"sub_procedures"`
	ProcessToken   string     `yaml:"process_token"`
	Name           string     `yaml:"name"`
	Version        string     `yaml:"version"`
}

type yamlStep struct {
	ID         interface{}    `yaml:"id"`
	Title      string         `yaml:"title"`
	Goals      string         `yaml:"goals"`
	Tasks      []string       `yaml:"tasks"`
	Outcomes   string         `yaml:"outcomes"`
	References []interface{}  `yaml:"references"`
	Flow       map[string]interface{} `yaml:"flow"`
	Tracking   map[string]interface{} `yaml:"tracking"`
}

type yamlSub struct {
	ID        interface{}            `yaml:"id"`
	Title     string                 `yaml:"title"`
	Goals     string                 `yaml:"goals"`
	Tasks     []string               `yaml:"tasks"`
	Outcomes  string                 `yaml:"outcomes"`
	InvokedBy []string               `yaml:"invoked_by"`
	Flow      map[string]interface{} `yaml:"flow"`
}

// LoadTurns returns main steps then optional sub_procedures as Turns (ChainFromPrevious=true). REQ-GOAGENT-YAML-STEPS.
func LoadTurns(path string, opts Options) ([]agentstream.Turn, error) {
	msgs, err := MessagesFromYAML(path, opts)
	if err != nil {
		return nil, err
	}
	out := make([]agentstream.Turn, 0, len(msgs))
	for _, m := range msgs {
		out = append(out, agentstream.Turn{Parts: []string{m}, ChainFromPrevious: true})
	}
	return out, nil
}

// MessagesFromYAML renders all messages in order. REQ-GOAGENT-YAML-STEPS.
func MessagesFromYAML(path string, opts Options) ([]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var doc yamlDoc
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, err
	}
	if doc.Steps == nil {
		return nil, fmt.Errorf("invalid checklist YAML: missing \"steps\" array in %s", path)
	}
	token := doc.ProcessToken
	if token == "" {
		token = doc.Name
	}
	if token == "" {
		token = "LEAD+TIED checklist"
	}
	mainSteps, err := sliceMainSteps(doc.Steps, path, opts.StepFromID, opts.StepToID)
	if err != nil {
		return nil, err
	}
	var out []string
	for _, step := range mainSteps {
		out = append(out, formatMainStep(&doc, step, token))
	}
	if opts.IncludeSubProcedures {
		for _, sub := range doc.SubProcedures {
			out = append(out, formatSubProcedure(sub, token))
		}
	}
	return out, nil
}

func stepIDString(s yamlStep) string {
	id := fmt.Sprint(s.ID)
	if id == "" || id == "<nil>" {
		return ""
	}
	return id
}

func findStepIndexByID(steps []yamlStep, want string) (int, bool) {
	for i, s := range steps {
		if stepIDString(s) == want {
			return i, true
		}
	}
	return 0, false
}

// sliceMainSteps returns an inclusive slice of main steps by document order.
func sliceMainSteps(steps []yamlStep, path, fromID, toID string) ([]yamlStep, error) {
	fromTrim := strings.TrimSpace(fromID)
	toTrim := strings.TrimSpace(toID)
	if fromTrim == "" && toTrim == "" {
		return steps, nil
	}
	if len(steps) == 0 {
		return nil, fmt.Errorf("invalid checklist YAML: empty \"steps\" in %s", path)
	}
	start := 0
	end := len(steps) - 1
	if fromTrim != "" {
		i, ok := findStepIndexByID(steps, fromTrim)
		if !ok {
			return nil, fmt.Errorf("checklist step id not found in %s: %q", path, fromTrim)
		}
		start = i
	}
	if toTrim != "" {
		i, ok := findStepIndexByID(steps, toTrim)
		if !ok {
			return nil, fmt.Errorf("checklist step id not found in %s: %q", path, toTrim)
		}
		end = i
	}
	if start > end {
		return nil, fmt.Errorf("checklist step range invalid in %s: from %q (index %d) after to %q (index %d)", path, fromTrim, start, toTrim, end)
	}
	return steps[start : end+1], nil
}

func formatMainStep(doc *yamlDoc, step yamlStep, token string) string {
	id := fmt.Sprint(step.ID)
	if id == "" || id == "<nil>" {
		id = "unknown"
	}
	lines := []string{
		"Execute this LEAD+TIED agent requirement implementation checklist step in the current workspace.",
		"Process token: " + token,
	}
	if doc.Name != "" || doc.Version != "" {
		lines = append(lines, fmt.Sprintf("Checklist: %s (v%s)", doc.Name, doc.Version))
	}
	lines = append(lines, "", fmt.Sprintf("## Step %s: %s", id, step.Title), "", "### Goals")
	if step.Goals != "" {
		lines = append(lines, strings.TrimSpace(step.Goals))
	}
	lines = append(lines, "", "### Tasks")
	for _, t := range step.Tasks {
		lines = append(lines, "- "+t)
	}
	lines = append(lines, "", "### Expected outcomes")
	if step.Outcomes != "" {
		lines = append(lines, strings.TrimSpace(step.Outcomes))
	}
	if len(step.References) > 0 {
		lines = append(lines, "", "### References")
		for _, r := range step.References {
			lines = append(lines, "- "+formatRef(r))
		}
	}
	if len(step.Flow) > 0 {
		lines = append(lines, "", "### Flow")
		lines = appendFlow(lines, step.Flow)
	}
	if step.Tracking != nil {
		if c, ok := step.Tracking["consideration_before_proceeding"].(string); ok && strings.TrimSpace(c) != "" {
			lines = append(lines, "", "### Before proceeding", strings.TrimSpace(c))
		}
	}
	lines = append(lines, "", "Complete this step now. Follow GOTO/CALL/RETURN semantics from the checklist when they apply.")
	return strings.Join(lines, "\n")
}

func formatSubProcedure(sub yamlSub, token string) string {
	id := fmt.Sprint(sub.ID)
	if id == "" || id == "<nil>" {
		id = "unknown"
	}
	lines := []string{
		"Sub-procedure (invoke when CALL references this id from a main step).",
		"Process token: " + token,
		"",
		fmt.Sprintf("## %s: %s", id, sub.Title),
		"",
		"### Goals",
	}
	if sub.Goals != "" {
		lines = append(lines, strings.TrimSpace(sub.Goals))
	}
	lines = append(lines, "", "### Tasks")
	for _, t := range sub.Tasks {
		lines = append(lines, "- "+t)
	}
	lines = append(lines, "", "### Expected outcomes")
	if sub.Outcomes != "" {
		lines = append(lines, strings.TrimSpace(sub.Outcomes))
	}
	if len(sub.InvokedBy) > 0 {
		lines = append(lines, "", "### Invoked by")
		for _, s := range sub.InvokedBy {
			lines = append(lines, "- "+s)
		}
	}
	if len(sub.Flow) > 0 {
		lines = append(lines, "", "### Flow")
		if rt, ok := sub.Flow["return_to"]; ok {
			lines = append(lines, fmt.Sprintf("- return_to: %v", rt))
		}
		if br, ok := sub.Flow["branches"].([]interface{}); ok {
			for _, b := range br {
				if bm, ok := b.(map[string]interface{}); ok {
					lines = append(lines, fmt.Sprintf("- IF %v THEN %v (target: %v)", bm["condition"], bm["action"], bm["target"]))
				}
			}
		}
	}
	lines = append(lines, "", "Run this sub-procedure when a step says CALL this id; then RETURN to the caller.")
	return strings.Join(lines, "\n")
}

func formatRef(r interface{}) string {
	switch v := r.(type) {
	case string:
		return v
	case map[string]interface{}:
		doc := fmt.Sprint(v["document"])
		prov := fmt.Sprint(v["provides"])
		return doc + " — " + prov
	default:
		return fmt.Sprint(v)
	}
}

func appendFlow(lines []string, flow map[string]interface{}) []string {
	if n, ok := flow["next"]; ok {
		lines = append(lines, fmt.Sprintf("- next: %v", n))
	}
	if n, ok := flow["next_when_all_blocks_done"]; ok {
		lines = append(lines, fmt.Sprintf("- next_when_all_blocks_done: %v", n))
	}
	if br, ok := flow["branches"].([]interface{}); ok {
		for _, b := range br {
			if bm, ok := b.(map[string]interface{}); ok {
				lines = append(lines, fmt.Sprintf("- IF %v THEN %v (target: %v)", bm["condition"], bm["action"], bm["target"]))
			}
		}
	}
	if calls, ok := flow["calls"].([]interface{}); ok {
		for _, c := range calls {
			lines = append(lines, fmt.Sprintf("- CALL %v", c))
		}
	}
	return lines
}
