// Package featurespec loads feature-spec-batch YAML and renders agent prompts.
// REQ: REQ-GOAGENT-FEATURESPEC
// ARCH: ARCH-GOAGENT-YAML-FEATURESPEC
// IMPL: IMPL-GOAGENT-FEATURESPEC-ORDER
package featurespec

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
)

// OrderFilter matches record order values (single value or inclusive range).
type OrderFilter struct {
	single *float64
	low    float64
	high   float64
	isRange bool
}

// ParseOrderFilter parses CLI value: N or N-M (floats allowed). REQ-GOAGENT-FEATURESPEC, REQ-GOAGENT-CLI-CONFIG.
func ParseOrderFilter(s string) (*OrderFilter, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil, fmt.Errorf("missing value for order filter")
	}
	reRange := regexp.MustCompile(`^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$`)
	if m := reRange.FindStringSubmatch(s); m != nil {
		low, _ := strconv.ParseFloat(m[1], 64)
		high, _ := strconv.ParseFloat(m[2], 64)
		if low > high {
			return nil, fmt.Errorf("order filter range must have low <= high (got %q)", s)
		}
		return &OrderFilter{low: low, high: high, isRange: true}, nil
	}
	reSingle := regexp.MustCompile(`^-?\d+(?:\.\d+)?$`)
	if !reSingle.MatchString(s) {
		return nil, fmt.Errorf("invalid order filter value: %q (expected N or N-M)", s)
	}
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return nil, err
	}
	return &OrderFilter{single: &v}, nil
}

// Matches returns whether order value o matches this filter.
func (f *OrderFilter) Matches(o float64) bool {
	if f == nil {
		return true
	}
	if f.isRange {
		return o >= f.low && o <= f.high
	}
	if f.single == nil {
		return true
	}
	return math.Abs(o-*f.single) < 1e-9 || o == *f.single
}
