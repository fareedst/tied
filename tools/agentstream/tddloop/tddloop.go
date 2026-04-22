// Package tddloop renders TDD loop YAML steps into agent prompt strings.
// REQ: REQ-GOAGENT-YAML-STEPS, REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML
// ARCH: ARCH-GOAGENT-YAML-TDD
// IMPL: IMPL-GOAGENT-TDDLOOP
package tddloop

import (
	"fmt"
	"os"
	"strings"

	"stdd/agentstream"

	"gopkg.in/yaml.v3"
)

type yamlDoc struct {
	Steps         []yamlStep `yaml:"steps"`
	ProcessToken  string     `yaml:"process_token"`
	Name          string     `yaml:"name"`
	Version       string     `yaml:"version"`
}

type yamlStep struct {
	ID       interface{} `yaml:"id"`
	Slug     string      `yaml:"slug"`
	Title    string      `yaml:"title"`
	Stage    string      `yaml:"stage"`
	Goals    string      `yaml:"goals"`
	Tasks    []string    `yaml:"tasks"`
	Outcomes string      `yaml:"outcomes"`
}

// LoadTurns returns one Turn per YAML step (ChainFromPrevious=true). REQ-GOAGENT-YAML-STEPS.
func LoadTurns(path string) ([]agentstream.Turn, error) {
	msgs, err := MessagesFromYAML(path)
	if err != nil {
		return nil, err
	}
	out := make([]agentstream.Turn, 0, len(msgs))
	for _, m := range msgs {
		out = append(out, agentstream.Turn{Parts: []string{m}, ChainFromPrevious: true})
	}
	return out, nil
}

// MessagesFromYAML loads and formats all steps. REQ-GOAGENT-YAML-STEPS.
func MessagesFromYAML(path string) ([]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var root map[string]interface{}
	if err := yaml.Unmarshal(data, &root); err != nil {
		return nil, err
	}
	stepsRaw, ok := root["steps"]
	if !ok || stepsRaw == nil {
		return nil, fmt.Errorf("invalid TDD YAML: missing \"steps\" array in %s", path)
	}
	if _, ok := stepsRaw.([]interface{}); !ok {
		return nil, fmt.Errorf("invalid TDD YAML: \"steps\" must be an array in %s", path)
	}
	var doc yamlDoc
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, err
	}
	if len(doc.Steps) == 0 {
		return nil, nil
	}
	token := doc.ProcessToken
	if token == "" {
		token = doc.Name
	}
	if token == "" {
		token = "TDD loop"
	}
	var out []string
	for _, step := range doc.Steps {
		out = append(out, formatStep(&doc, step, token))
	}
	return out, nil
}

func stepPrimaryLabel(step yamlStep) string {
	if slug := strings.TrimSpace(step.Slug); slug != "" {
		return slug
	}
	id := fmt.Sprint(step.ID)
	if id == "" || id == "<nil>" {
		return "unknown"
	}
	return id
}

func formatStep(doc *yamlDoc, step yamlStep, token string) string {
	label := stepPrimaryLabel(step)
	title := step.Title
	lines := []string{
		"Follow the TDD development loop for this workspace.",
		"Process token: " + token,
	}
	if doc.Name != "" || doc.Version != "" {
		lines = append(lines, fmt.Sprintf("Document: %s (%s)", doc.Name, doc.Version))
	}
	lines = append(lines, "", fmt.Sprintf("## Step %s: %s", label, title))
	if step.Stage != "" {
		lines = append(lines, "Stage: "+step.Stage)
	}
	lines = append(lines, "", "### Goals")
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
	lines = append(lines, "", "Execute this step now. Do not skip checklist items unless the repo state already satisfies them.")
	return strings.Join(lines, "\n")
}
