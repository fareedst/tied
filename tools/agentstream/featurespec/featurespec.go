package featurespec

import (
	"fmt"
	"io"
	"math"
	"os"
	"sort"
	"strconv"
	"strings"

	"stdd/agentstream"

	"gopkg.in/yaml.v3"
)

// Options configures feature-spec loading. REQ-GOAGENT-FEATURESPEC.
type Options struct {
	OrderFilter *OrderFilter
}

// LoadTurns reads path and returns one Turn per matching record (ChainFromPrevious=false). REQ-GOAGENT-FEATURESPEC.
func LoadTurns(path string, opts *Options) ([]agentstream.Turn, error) {
	msgs, err := MessagesFromYAML(path, opts)
	if err != nil {
		return nil, err
	}
	out := make([]agentstream.Turn, 0, len(msgs))
	for _, m := range msgs {
		out = append(out, agentstream.Turn{Parts: []string{m}, ChainFromPrevious: false})
	}
	return out, nil
}

// MessagesFromYAML returns rendered markdown strings per record. REQ-GOAGENT-FEATURESPEC.
func MessagesFromYAML(path string, opts *Options) ([]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var doc yaml.Node
	if err := yaml.Unmarshal(data, &doc); err != nil {
		return nil, err
	}
	records, err := normalizeRoot(&doc, path)
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("invalid feature-spec batch YAML: expected a non-empty list of records in %s", path)
	}
	for i, rec := range records {
		if rec == nil || rec.Kind != yaml.MappingNode {
			return nil, fmt.Errorf("invalid feature-spec batch YAML: item %d must be a map", i)
		}
	}
	sorted := sortRecords(records)
	selected, err := selectByOrder(sorted, opts, path)
	if err != nil {
		return nil, err
	}
	out := make([]string, 0, len(selected))
	for _, n := range selected {
		msg, err := messageForRecord(n)
		if err != nil {
			return nil, err
		}
		out = append(out, msg)
	}
	return out, nil
}

// Preview writes rendered prompts with === headers (stdout). REQ-GOAGENT-FEATURESPEC.
func Preview(path string, opts *Options, w io.Writer) error {
	msgs, err := MessagesFromYAML(path, opts)
	if err != nil {
		return err
	}
	n := len(msgs)
	for i, msg := range msgs {
		_, _ = fmt.Fprintf(w, "=== prompt %d/%d ===\n", i+1, n)
		_, _ = fmt.Fprint(w, msg)
		if i < n-1 {
			_, _ = fmt.Fprint(w, "\n---\n")
		} else {
			_, _ = fmt.Fprint(w, "\n")
		}
	}
	return nil
}

func normalizeRoot(doc *yaml.Node, path string) ([]*yaml.Node, error) {
	if doc.Kind == 0 {
		return nil, fmt.Errorf("invalid feature-spec batch YAML: empty document in %s", path)
	}
	// Unmarshal wraps: doc is usually Document with one child
	var content *yaml.Node
	switch doc.Kind {
	case yaml.DocumentNode:
		if len(doc.Content) == 0 {
			return nil, fmt.Errorf("invalid feature-spec batch YAML: empty document in %s", path)
		}
		content = doc.Content[0]
	default:
		content = doc
	}
	switch content.Kind {
	case yaml.SequenceNode:
		return content.Content, nil
	case yaml.MappingNode:
		feats := mapLookup(content, "features")
		if feats != nil && feats.Kind == yaml.SequenceNode {
			return feats.Content, nil
		}
		return nil, fmt.Errorf("invalid feature-spec batch YAML: root must be an array or a mapping with key \"features\"")
	default:
		return nil, fmt.Errorf("invalid feature-spec batch YAML: root must be an array or a mapping with key \"features\"")
	}
}

func mappingHasKey(m *yaml.Node, key string) bool {
	if m == nil || m.Kind != yaml.MappingNode {
		return false
	}
	for i := 0; i+1 < len(m.Content); i += 2 {
		if m.Content[i].Value == key {
			return true
		}
	}
	return false
}

func mapLookup(m *yaml.Node, key string) *yaml.Node {
	for i := 0; i+1 < len(m.Content); i += 2 {
		k := m.Content[i]
		v := m.Content[i+1]
		if k.Value == key {
			return v
		}
	}
	return nil
}

func sortRecords(records []*yaml.Node) []*yaml.Node {
	if len(records) == 0 {
		return records
	}
	hasAny := false
	for _, r := range records {
		if mappingHasKey(r, "order") {
			hasAny = true
			break
		}
	}
	if !hasAny {
		return records
	}
	type pair struct {
		n   *yaml.Node
		idx int
	}
	pairs := make([]pair, 0, len(records))
	for i, r := range records {
		pairs = append(pairs, pair{n: r, idx: i})
	}
	sort.SliceStable(pairs, func(i, j int) bool {
		oi := orderKey(pairs[i].n)
		oj := orderKey(pairs[j].n)
		if oi != oj {
			return oi < oj
		}
		return pairs[i].idx < pairs[j].idx
	})
	out := make([]*yaml.Node, len(pairs))
	for i := range pairs {
		out[i] = pairs[i].n
	}
	return out
}

func orderKey(n *yaml.Node) float64 {
	on := mapLookup(n, "order")
	if on == nil || on.Value == "" {
		return math.Inf(1)
	}
	f, err := strconv.ParseFloat(strings.TrimSpace(on.Value), 64)
	if err != nil {
		return math.Inf(1)
	}
	return f
}

func selectByOrder(records []*yaml.Node, opts *Options, path string) ([]*yaml.Node, error) {
	if opts == nil || opts.OrderFilter == nil {
		return records, nil
	}
	f := opts.OrderFilter
	var sel []*yaml.Node
	for _, rec := range records {
		on := mapLookup(rec, "order")
		if on == nil || on.Value == "" {
			continue
		}
		v, err := strconv.ParseFloat(strings.TrimSpace(on.Value), 64)
		if err != nil {
			continue
		}
		if f.Matches(v) {
			sel = append(sel, rec)
		}
	}
	if len(sel) == 0 {
		return nil, fmt.Errorf("no feature-spec batch records matched order filter in %s", path)
	}
	return sel, nil
}

func messageForRecord(rec *yaml.Node) (string, error) {
	name := scalarString(mapLookup(rec, "feature_name"))
	goal := scalarString(mapLookup(rec, "goal"))
	if strings.TrimSpace(name) == "" {
		return "", fmt.Errorf("feature spec record requires feature_name")
	}
	if strings.TrimSpace(goal) == "" {
		return "", fmt.Errorf("feature spec record requires goal")
	}
	orderNode := mapLookup(rec, "order")
	var lines []string
	if orderNode == nil || strings.TrimSpace(orderNode.Value) == "" {
		lines = append(lines, "# "+strings.TrimSpace(name))
	} else {
		lines = append(lines, fmt.Sprintf("# [%s] %s", strings.TrimSpace(orderNode.Value), strings.TrimSpace(name)))
	}
	lines = append(lines, "", "## Goal", strings.TrimSpace(goal), "")
	appendSection(&lines, "## Rules", listItemsNode(mapLookup(rec, "rules")))
	if err := appendExamples(&lines, mapLookup(rec, "examples")); err != nil {
		return "", err
	}
	appendSection(&lines, "## Boundary conditions", listItemsNode(mapLookup(rec, "boundary_conditions")))
	oos := scalarString(mapLookup(rec, "out_of_scope"))
	if strings.TrimSpace(oos) != "" {
		lines = append(lines, "## Out of scope", strings.TrimSpace(oos), "")
	}
	return strings.TrimSpace(strings.Join(lines, "\n")), nil
}

func scalarString(n *yaml.Node) string {
	if n == nil {
		return ""
	}
	return n.Value
}

func listItemsNode(n *yaml.Node) []string {
	if n == nil {
		return nil
	}
	switch n.Kind {
	case yaml.SequenceNode:
		var out []string
		for _, c := range n.Content {
			s := strings.TrimSpace(scalarOrStringify(c))
			if s != "" {
				out = append(out, s)
			}
		}
		return out
	default:
		s := strings.TrimSpace(n.Value)
		if s == "" {
			return nil
		}
		return []string{s}
	}
}

func scalarOrStringify(n *yaml.Node) string {
	if n == nil {
		return ""
	}
	if n.Kind == yaml.ScalarNode {
		return n.Value
	}
	b, _ := yaml.Marshal(n)
	return strings.TrimSpace(string(b))
}

func appendSection(lines *[]string, heading string, items []string) {
	if len(items) == 0 {
		return
	}
	*lines = append(*lines, heading)
	for _, it := range items {
		*lines = append(*lines, "- "+it)
	}
	*lines = append(*lines, "")
}

func appendExamples(lines *[]string, n *yaml.Node) error {
	if n == nil {
		return nil
	}
	var arr []*yaml.Node
	if n.Kind == yaml.SequenceNode {
		arr = n.Content
	} else {
		arr = []*yaml.Node{n}
	}
	if len(arr) == 0 {
		return nil
	}
	*lines = append(*lines, "## Examples")
	for i, ex := range arr {
		*lines = append(*lines, fmt.Sprintf("### Example %d", i+1))
		if ex.Kind != yaml.MappingNode {
			*lines = append(*lines, strings.TrimSpace(scalarOrStringify(ex)), "")
			continue
		}
		g := scalarString(mapLookup(ex, "given"))
		w := scalarString(mapLookup(ex, "when"))
		then := scalarString(mapLookup(ex, "then"))
		if strings.TrimSpace(g) != "" {
			*lines = append(*lines, "- Given: "+strings.TrimSpace(g))
		}
		if strings.TrimSpace(w) != "" {
			*lines = append(*lines, "- When: "+strings.TrimSpace(w))
		}
		if strings.TrimSpace(then) != "" {
			*lines = append(*lines, "- Then: "+strings.TrimSpace(then))
		}
		*lines = append(*lines, "")
	}
	return nil
}
