// Package checklist renders agent-req-implementation-checklist-style YAML into Turns.
// REQ: REQ-GOAGENT-YAML-STEPS, REQ-GOAGENT-YAML-STEP-RENDER, PROC-AGENT_REQ_CHECKLIST
// ARCH: ARCH-GOAGENT-YAML-CHECKLIST
// IMPL: IMPL-GOAGENT-CHECKLIST
package checklist

import (
	"fmt"
	"os"
	"sort"
	"strings"

	"stdd/agentstream"

	"gopkg.in/yaml.v3"
)

// Options configures checklist expansion. REQ-GOAGENT-YAML-STEPS.
type Options struct {
	IncludeSubProcedures bool
	// StepFromID and StepToID are optional inclusive bounds on main steps only (YAML order).
	// Each bound matches the step slug (YAML "slug").
	// Empty string means unbounded on that side. REQ-GOAGENT-YAML-STEP-RENDER.
	StepFromID string
	StepToID   string
	// Vars maps placeholder keys to values for {{KEY}} expansion in rendered checklist text.
	Vars map[string]string
	// ChecklistVarStrict: if true, any remaining {{NAME}} after expansion is an error.
	ChecklistVarStrict bool
}

type yamlDoc struct {
	Steps         []yamlStep `yaml:"steps"`
	SubProcedures []yamlSub  `yaml:"sub_procedures"`
	ProcessToken  string     `yaml:"process_token"`
	Name          string     `yaml:"name"`
	Version       string     `yaml:"version"`
}

type yamlStep struct {
	Slug                    string                 `yaml:"slug"`
	Title                   string                 `yaml:"title"`
	Goals                   string                 `yaml:"goals"`
	Preconditions           []string               `yaml:"preconditions"`
	Tasks                   []string               `yaml:"tasks"`
	Outcomes                string                 `yaml:"outcomes"`
	References              []interface{}          `yaml:"references"`
	Flow                    map[string]interface{} `yaml:"flow"`
	Tracking                map[string]interface{} `yaml:"tracking"`
	AgentstreamNewSession   bool                   `yaml:"agentstream_new_session"`
}

type yamlSub struct {
	Slug                  string                 `yaml:"slug"`
	Title                 string                 `yaml:"title"`
	Goals                 string                 `yaml:"goals"`
	Preconditions         []string               `yaml:"preconditions"`
	Tasks                 []string               `yaml:"tasks"`
	Outcomes              string                 `yaml:"outcomes"`
	InvokedBy             []string               `yaml:"invoked_by"`
	Flow                  map[string]interface{} `yaml:"flow"`
	AgentstreamNewSession bool                   `yaml:"agentstream_new_session"`
}

type renderedMessage struct {
	text                string
	stub                string
	chainFromPrevious   bool
}

// LoadTurns returns main steps then optional sub_procedures as Turns.
// ChainFromPrevious is true by default; if a step or sub has agentstream_new_session: true, that turn
// has ChainFromPrevious false so the driver issues it without --resume (new session). REQ-GOAGENT-YAML-STEPS.
func LoadTurns(path string, opts Options) ([]agentstream.Turn, error) {
	msgs, err := messagesRendered(path, opts)
	if err != nil {
		return nil, err
	}
	out := make([]agentstream.Turn, 0, len(msgs))
	for _, m := range msgs {
		out = append(out, agentstream.Turn{
			Parts:             []string{m.text},
			ChainFromPrevious: m.chainFromPrevious,
			StepStub:          m.stub,
		})
	}
	return out, nil
}

// MessagesFromYAML renders all messages in order. REQ-GOAGENT-YAML-STEPS.
func MessagesFromYAML(path string, opts Options) ([]string, error) {
	msgs, err := messagesRendered(path, opts)
	if err != nil {
		return nil, err
	}
	out := make([]string, len(msgs))
	for i := range msgs {
		out[i] = msgs[i].text
	}
	return out, nil
}

func messagesRendered(path string, opts Options) ([]renderedMessage, error) {
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
	if err := validateStepsHaveSlugs(doc.Steps, path); err != nil {
		return nil, err
	}
	if err := validateSubsHaveSlugs(doc.SubProcedures, path); err != nil {
		return nil, err
	}
	if err := validateDuplicateSlugs(doc.Steps, path); err != nil {
		return nil, err
	}
	token := doc.ProcessToken
	if token == "" {
		token = doc.Name
	}
	if token == "" {
		token = "LEAD+TIED checklist"
	}
	stubMap := buildStubAliasMap(&doc)
	stubKeys := sortedStubKeys(stubMap)

	mainSteps, err := sliceMainSteps(doc.Steps, path, opts.StepFromID, opts.StepToID)
	if err != nil {
		return nil, err
	}
	var out []renderedMessage
	vars := opts.Vars
	for _, step := range mainSteps {
		text := formatMainStep(&doc, step, token, vars, stubMap, stubKeys)
		if err := validateStrictResidual(path, opts.ChecklistVarStrict, text, stepPrimaryLabel(step)); err != nil {
			return nil, err
		}
		out = append(out, renderedMessage{
			text:              text,
			stub:              stepPrimaryLabel(step),
			chainFromPrevious: !step.AgentstreamNewSession,
		})
	}
	if opts.IncludeSubProcedures {
		for _, sub := range doc.SubProcedures {
			text := formatSubProcedure(sub, token, vars, stubMap, stubKeys)
			if err := validateStrictResidual(path, opts.ChecklistVarStrict, text, subPrimaryLabel(sub)); err != nil {
				return nil, err
			}
			out = append(out, renderedMessage{
				text:              text,
				stub:              subPrimaryLabel(sub),
				chainFromPrevious: !sub.AgentstreamNewSession,
			})
		}
	}
	return out, nil
}

func validateStrictResidual(path string, strict bool, text, stubLabel string) error {
	if !strict {
		return nil
	}
	if hasResidualChecklistPlaceholder(text) {
		return fmt.Errorf("checklist %s: unresolved {{NAME}} placeholder(s) in step %q (--checklist-var-strict)", path, stubLabel)
	}
	return nil
}

func formatSubHeading(slug, title string) string {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		slug = "unknown"
	}
	return fmt.Sprintf("## %s: %s", slug, title)
}

func subPrimaryLabel(sub yamlSub) string {
	if slug := strings.TrimSpace(sub.Slug); slug != "" {
		return slug
	}
	return "unknown"
}

func buildStubAliasMap(doc *yamlDoc) map[string]string {
	m := make(map[string]string)
	for _, s := range doc.Steps {
		if slug := strings.TrimSpace(s.Slug); slug != "" {
			m[slug] = slug
		}
	}
	for _, sub := range doc.SubProcedures {
		if slug := strings.TrimSpace(sub.Slug); slug != "" {
			m[slug] = slug
		}
	}
	return m
}

func sortedStubKeys(stubMap map[string]string) []string {
	keys := make([]string, 0, len(stubMap))
	for k := range stubMap {
		keys = append(keys, k)
	}
	sort.Slice(keys, func(i, j int) bool {
		li, lj := len(keys[i]), len(keys[j])
		if li != lj {
			return li > lj
		}
		return keys[i] < keys[j]
	})
	return keys
}

func replaceStubRefsInText(s string, stubMap map[string]string, stubKeys []string) string {
	out := s
	for _, k := range stubKeys {
		lab := stubMap[k]
		out = strings.ReplaceAll(out, k, lab)
	}
	return out
}

func resolveFlowRef(v interface{}, stubMap map[string]string) string {
	s := strings.TrimSpace(fmt.Sprint(v))
	if s == "" || s == "<nil>" {
		return s
	}
	if lab, ok := stubMap[s]; ok {
		return lab
	}
	return s
}

func validateDuplicateSlugs(steps []yamlStep, path string) error {
	seen := make(map[string]int)
	for i, s := range steps {
		slug := strings.TrimSpace(s.Slug)
		if j, ok := seen[slug]; ok {
			return fmt.Errorf("checklist duplicate slug %q at \"steps\" indices %d and %d in %s", slug, j, i, path)
		}
		seen[slug] = i
	}
	return nil
}

func validateStepsHaveSlugs(steps []yamlStep, path string) error {
	for i, s := range steps {
		if strings.TrimSpace(s.Slug) == "" {
			return fmt.Errorf("checklist step at \"steps\" index %d missing required \"slug\" in %s", i, path)
		}
	}
	return nil
}

func validateSubsHaveSlugs(subs []yamlSub, path string) error {
	for i, s := range subs {
		if strings.TrimSpace(s.Slug) == "" {
			return fmt.Errorf("checklist sub_procedures index %d missing required \"slug\" in %s", i, path)
		}
	}
	return nil
}

func findMainStepIndex(steps []yamlStep, path, want string) (int, error) {
	want = strings.TrimSpace(want)
	if want == "" {
		return 0, fmt.Errorf("checklist step lookup: empty slug in %s", path)
	}
	var matches []int
	for i, s := range steps {
		slug := strings.TrimSpace(s.Slug)
		if slug != "" && slug == want {
			matches = append(matches, i)
		}
	}
	switch len(matches) {
	case 1:
		return matches[0], nil
	case 0:
		return 0, fmt.Errorf("checklist step slug not found in %s: %q", path, want)
	default:
		return 0, fmt.Errorf("checklist step slug is ambiguous in %s: %q matches multiple main steps", path, want)
	}
}

func stepPrimaryLabel(s yamlStep) string {
	if slug := strings.TrimSpace(s.Slug); slug != "" {
		return slug
	}
	return "unknown"
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
		i, err := findMainStepIndex(steps, path, fromTrim)
		if err != nil {
			return nil, err
		}
		start = i
	}
	if toTrim != "" {
		i, err := findMainStepIndex(steps, path, toTrim)
		if err != nil {
			return nil, err
		}
		end = i
	}
	if start > end {
		return nil, fmt.Errorf("checklist step range invalid in %s: from %q (index %d) after to %q (index %d)", path, fromTrim, start, toTrim, end)
	}
	return steps[start : end+1], nil
}

func formatMainStep(doc *yamlDoc, step yamlStep, token string, vars map[string]string, stubMap map[string]string, stubKeys []string) string {
	lines := []string{
		"Execute this LEAD+TIED agent requirement implementation checklist step in the current workspace.",
		"Process token: " + token,
	}
	if doc.Name != "" || doc.Version != "" {
		lines = append(lines, fmt.Sprintf("Checklist: %s (v%s)", doc.Name, doc.Version))
	}
	title := strings.TrimSpace(step.Title)
	if title != "" {
		title = expandThenStub(title, vars, stubMap, stubKeys)
	}
	stepHead := fmt.Sprintf("## Step %s: %s", stepPrimaryLabel(step), title)
	lines = append(lines, "", stepHead, "", "### Goals")
	if step.Goals != "" {
		lines = append(lines, trimExpandThenStub(step.Goals, vars, stubMap, stubKeys))
	}
	if len(step.Preconditions) > 0 {
		lines = append(lines, "", "### Preconditions")
		for _, p := range step.Preconditions {
			lines = append(lines, "- "+expandThenStub(p, vars, stubMap, stubKeys))
		}
	}
	lines = append(lines, "", "### Tasks")
	for _, t := range step.Tasks {
		lines = append(lines, "- "+expandThenStub(t, vars, stubMap, stubKeys))
	}
	lines = append(lines, "", "### Expected outcomes")
	if step.Outcomes != "" {
		lines = append(lines, trimExpandThenStub(step.Outcomes, vars, stubMap, stubKeys))
	}
	if len(step.References) > 0 {
		lines = append(lines, "", "### References")
		for _, r := range step.References {
			lines = append(lines, "- "+expandThenStub(formatRefRaw(r), vars, stubMap, stubKeys))
		}
	}
	if len(step.Flow) > 0 {
		lines = append(lines, "", "### Flow")
		lines = appendFlow(lines, step.Flow, vars, stubMap, stubKeys)
	}
	if step.Tracking != nil {
		if c, ok := step.Tracking["consideration_before_proceeding"].(string); ok && strings.TrimSpace(c) != "" {
			lines = append(lines, "", "### Before proceeding", trimExpandThenStub(c, vars, stubMap, stubKeys))
		}
	}
	lines = append(lines, "", "Complete this step now. Follow GOTO/CALL/RETURN semantics from the checklist when they apply.")
	return strings.Join(lines, "\n")
}

func formatSubProcedure(sub yamlSub, token string, vars map[string]string, stubMap map[string]string, stubKeys []string) string {
	subTitle := strings.TrimSpace(sub.Title)
	if subTitle != "" {
		subTitle = expandThenStub(subTitle, vars, stubMap, stubKeys)
	}
	lines := []string{
		"Sub-procedure (invoke when CALL references this slug from a main step).",
		"Process token: " + token,
		"",
		formatSubHeading(sub.Slug, subTitle),
		"",
		"### Goals",
	}
	if sub.Goals != "" {
		lines = append(lines, trimExpandThenStub(sub.Goals, vars, stubMap, stubKeys))
	}
	if len(sub.Preconditions) > 0 {
		lines = append(lines, "", "### Preconditions")
		for _, p := range sub.Preconditions {
			lines = append(lines, "- "+expandThenStub(p, vars, stubMap, stubKeys))
		}
	}
	lines = append(lines, "", "### Tasks")
	for _, t := range sub.Tasks {
		lines = append(lines, "- "+expandThenStub(t, vars, stubMap, stubKeys))
	}
	lines = append(lines, "", "### Expected outcomes")
	if sub.Outcomes != "" {
		lines = append(lines, trimExpandThenStub(sub.Outcomes, vars, stubMap, stubKeys))
	}
	if len(sub.InvokedBy) > 0 {
		lines = append(lines, "", "### Invoked by")
		for _, s := range sub.InvokedBy {
			lines = append(lines, "- "+expandThenStub(s, vars, stubMap, stubKeys))
		}
	}
	if len(sub.Flow) > 0 {
		lines = append(lines, "", "### Flow")
		lines = appendFlow(lines, sub.Flow, vars, stubMap, stubKeys)
	}
	lines = append(lines, "", "Run this sub-procedure when a step says CALL this slug; then RETURN to the caller.")
	return strings.Join(lines, "\n")
}

func formatRefRaw(r interface{}) string {
	switch v := r.(type) {
	case string:
		return v
	case map[string]interface{}:
		doc := fmt.Sprint(v["document"])
		prov := fmt.Sprint(v["provides"])
		return doc + " — " + prov
	default:
		return fmt.Sprint(r)
	}
}

func appendFlow(lines []string, flow map[string]interface{}, vars map[string]string, stubMap map[string]string, stubKeys []string) []string {
	if rt, ok := flow["return_to"]; ok {
		lines = append(lines, fmt.Sprintf("- return_to: %s", resolveFlowRef(rt, stubMap)))
	}
	if n, ok := flow["next"]; ok {
		lines = append(lines, fmt.Sprintf("- next: %s", resolveFlowRef(n, stubMap)))
	}
	if n, ok := flow["next_when_all_blocks_done"]; ok {
		lines = append(lines, fmt.Sprintf("- next_when_all_blocks_done: %s", resolveFlowRef(n, stubMap)))
	}
	if br, ok := flow["branches"].([]interface{}); ok {
		for _, b := range br {
			if bm, ok := b.(map[string]interface{}); ok {
				cond := expandThenStub(fmt.Sprint(bm["condition"]), vars, stubMap, stubKeys)
				act := expandThenStub(fmt.Sprint(bm["action"]), vars, stubMap, stubKeys)
				tgt := resolveFlowRef(bm["target"], stubMap)
				lines = append(lines, fmt.Sprintf("- IF %s THEN %s (target: %s)", cond, act, tgt))
			}
		}
	}
	if calls, ok := flow["calls"].([]interface{}); ok {
		for _, c := range calls {
			lines = append(lines, fmt.Sprintf("- CALL %s", resolveFlowRef(c, stubMap)))
		}
	}
	return lines
}
