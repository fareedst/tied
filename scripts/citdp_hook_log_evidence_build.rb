#!/usr/bin/env ruby
# frozen_string_literal: true

# Regenerates CITDP ↔ hook-log correlation artifacts under docs/.
# Run from repo root:
#   ruby scripts/citdp_hook_log_evidence_build.rb
#
# Requires: ~/.cursor/logs/conv_ruby_treegrep_*.yaml for aggregate (optional).
# [PROC-AGENT_REQ_CHECKLIST] evidence / CITDP follow-up tooling.

require 'date'
require 'pathname'
require 'psych'
require 'set'

ROOT = Pathname.new(__dir__).join('..').expand_path
DOCS = ROOT.join('docs')
LOG_GLOB = File.expand_path('~/.cursor/logs/conv_ruby_treegrep_*.yaml')

def extract_citdp_rows
  rows = []
  Dir.glob(DOCS.join('citdp', 'CITDP-*.yaml').to_s).sort.each do |path|
    raw = File.read(path, encoding: 'UTF-8')
    doc = Psych.safe_load(
      raw,
      permitted_classes: [Date, Time, Symbol],
      permitted_symbols: [],
      aliases: true
    )
    next unless doc

    id = doc.dig('record', 'change_request_id') || doc['change_request_id']
    dates = []
    walk = lambda do |o, depth = 0|
      return if depth > 30

      case o
      when Hash
        o.each do |k, v|
          dates << v.to_s if %w[date completed_at refreshed_at persisted_at written_date].include?(k.to_s) && v
          walk.call(v, depth + 1)
        end
      when Array
        o.each { |e| walk.call(e, depth + 1) }
      end
    end
    walk.call(doc)
    rows << { file: File.basename(path), id: id, dates: dates.uniq.sort }
  end
  rows
end

def calendar_days_from_strings(date_strings)
  days = Set.new
  date_strings.each do |s|
    m = s.match(/\A(\d{4}-\d{2}-\d{2})/)
    days << m[1] if m
  end
  days.to_a.sort
end

def hook_logs_by_day
  by_day = Hash.new { |h, k| h[k] = [] }
  Dir.glob(LOG_GLOB).sort.each do |p|
    base = File.basename(p, '.yaml')
    # conv_ruby_treegrep_2026-03-23-16-55_<uuid>
    m = base.match(/\Aconv_ruby_treegrep_(\d{4}-\d{2}-\d{2})-(\d{2}-\d{2})_(.+)\z/)
    next unless m

    day = m[1]
    conv_id = m[3]
    by_day[day] << { path: p, conversation_id: conv_id, segment: "#{m[1]}-#{m[2]}" }
  end
  by_day
end

def build_markdown(rows, by_day)
  lines = []
  lines << '# CITDP evidence: hook logs and correlation'
  lines << ''
  lines << 'Machine-readable hook events are under `~/.cursor/logs/conv_ruby_treegrep_<UTC-date-segment>_<conversation_id>.yaml` (see `.cursor/hooks/log.rb`).'
  lines << 'CITDP archives live under [`docs/citdp/`](citdp/). This document ties them together for audits.'
  lines << ''
  lines << '## Regenerate artifacts'
  lines << ''
  lines << '```bash'
  lines << 'ruby scripts/citdp_hook_log_evidence_build.rb'
  lines << 'ruby scripts/analyze_hook_log.rb --aggregate -g \'~/.cursor/logs/conv_ruby_treegrep_*.yaml\' \\'
  lines << '  2> docs/citdp-evidence-hook-log-aggregate-summary.yaml \\'
  lines << '  1> docs/citdp-evidence-hook-log-per-file.yaml'
  lines << '```'
  lines << ''
  lines << '## Aggregate summary (all `conv_ruby_treegrep` logs)'
  lines << ''
  agg_path = DOCS.join('citdp-evidence-hook-log-aggregate-summary.yaml')
  if agg_path.file?
    lines << "Source: [`docs/citdp-evidence-hook-log-aggregate-summary.yaml`](citdp-evidence-hook-log-aggregate-summary.yaml) (stderr YAML from `analyze_hook_log.rb --aggregate`)."
    lines << ''
    summary = Psych.safe_load(agg_path.read, permitted_classes: [Date, Time], aliases: true)
    s = summary['summary'] || {}
    lines << "| Metric | Value |"
    lines << "| --- | --- |"
    lines << "| Files analyzed | #{s['files']} |"
    lines << "| Total size | #{s['total_size_human']} |"
    lines << "| Total hook records | #{s['total_records']} |"
    lines << "| `postToolUseFailure` events (sum) | #{s['total_failure_events']} |"
    lines << "| Parse errors (sum) | #{s['parse_errors']} |"
    lines << "| Session end records | #{s.dig('sessions', 'total')} |"
    tc = s['tool_call_summary'] || {}
    lines << "| `MCP:tied_validate_consistency` (approx.) | #{tc['MCP:tied_validate_consistency'] || '—'} |"
    lines << "| `MCP:yaml_index_validate` | #{tc['MCP:yaml_index_validate'] || '—'} |"
    lines << ''
    fails = (s['failures'] || []).first(8)
    if fails.any?
      lines << '### Top `postToolUseFailure` messages (merged)'
      lines << ''
      lines << '| Count | Tool | Error (truncated) |'
      lines << '| ---: | --- | --- |'
      fails.each do |h|
        err = h['error'].to_s.gsub('|', '\\|')
        err = err[0, 120] + '…' if err.length > 120
        lines << "| #{h['count']} | #{h['tool']} | #{err} |"
      end
      lines << ''
    end
  else
    lines << '_Run `analyze_hook_log.rb` as above to generate `citdp-evidence-hook-log-aggregate-summary.yaml`._'
    lines << ''
  end

  lines << '## CITDP record dates → candidate hook logs (same calendar day)'
  lines << ''
  lines << 'Hook filenames use UTC segment start time; CITDP uses completion dates in metadata. Use this table as a **hint** — multiple sessions may occur per day.'
  lines << ''
  lines << '| CITDP file | change_request_id | Date fields (extracted) | Hook logs same day (count) |'
  lines << '| --- | --- | --- | --- |'

  rows.each do |r|
    days = calendar_days_from_strings(r[:dates])
    counts = days.map { |d| by_day[d].size }
    hint = if days.empty?
             '—'
           else
             days.zip(counts).map { |d, c| "#{d} (#{c} logs)" }.join('<br>')
           end
    lines << "| #{r[:file]} | #{r[:id]} | #{r[:dates].join('; ')} | #{hint} |"
  end
  lines << ''

  lines << '## `postToolUseFailure` vs CITDP “yq multi-document” narrative'
  lines << ''
  lines << '`postToolUseFailure` in these logs is dominated by **Read/Grep “file not found”** (stale paths, optional docs like `tied/docs/citdp-policy.md`, or tests not yet created).'
  lines << 'The **yq multi-file merge** incidents are documented in CITDP `leap_feedback` / `risk_analysis` text; the same narrative appears inside hook transcripts when agents paste CITDP YAML — search a large log for `multi-arg yq` or `mikefarah yq`.'
  lines << ''
  lines << 'Example (session `1b7806e1-047a-4692-bf01-445cbfc2b459`, 2026-03-22):'
  lines << ''
  lines << '```text'
  lines << 'rg "multi-arg yq\\|mikefarah yq" ~/.cursor/logs/conv_ruby_treegrep_2026-03-22-16-51_1b7806e1-047a-4692-bf01-445cbfc2b459.yaml'
  lines << '```'
  lines << ''

  lines << '## TSV extract'
  lines << ''
  lines << '[`docs/citdp-evidence-citdp-dates.tsv`](citdp-evidence-citdp-dates.tsv) — tab-separated `basename`, `change_request_id`, date strings.'
  lines << ''

  DOCS.join('citdp-evidence-hook-log-correlation.md').write(lines.join("\n"), encoding: 'UTF-8')
  puts "Wrote #{DOCS.join('citdp-evidence-hook-log-correlation.md')}"
end

def write_tsv(rows)
  tsv = DOCS.join('citdp-evidence-citdp-dates.tsv')
  File.open(tsv, 'w:utf-8') do |io|
    rows.each do |r|
      io.puts [r[:file], r[:id], r[:dates].join('; ')].join("\t")
    end
  end
  puts "Wrote #{tsv}"
end

rows = extract_citdp_rows
write_tsv(rows)
build_markdown(rows, hook_logs_by_day)
