#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
# How: Emit claim-surface.v1 and evidence stubs from TIED indexes and detail files.

require "digest"
require "fileutils"
require "json"
require "optparse"
require "yaml"

DEFAULT_REQUEST_TOKEN = "REQ-TIED_CLAIMS_EVIDENCE_REVIEW"

class BuildClaimsEvidenceFromTied
  def initialize(options)
    @options = options
  end

  def run
    validate!
    surface = build_claim_surface
    stubs = build_evidence_stubs(surface)
    provenance = build_provenance(surface)

    if @options[:output_dir]
      out = File.expand_path(@options[:output_dir])
      FileUtils.mkdir_p(out)
      write_json(File.join(out, "claim-surface.v1.json"), surface)
      write_json(File.join(out, "evidence-stubs.json"), stubs)
      write_json(File.join(out, "generator-provenance.json"), provenance)
      write_expected_dispositions(out, surface, stubs)
    end

    puts JSON.pretty_generate({ "claim_surface" => surface, "evidence_stubs" => stubs, "provenance" => provenance })
  end

  private

  def validate!
    missing = []
    missing << "project_root" if @options[:project_root].to_s.empty?
    abort("Missing required inputs: #{missing.join(', ')}") unless missing.empty?

    @project_root = File.expand_path(@options[:project_root])
    @tied_base = @options[:tied_base_path] ? File.expand_path(@options[:tied_base_path]) : File.join(@project_root, "tied")
    abort("Project root does not exist: #{@project_root}") unless File.directory?(@project_root)
    abort("TIED base path does not exist: #{@tied_base}") unless File.directory?(@tied_base)
  end

  def request_token
    @options[:request_token].to_s.empty? ? DEFAULT_REQUEST_TOKEN : @options[:request_token]
  end

  def source_revision
    @options[:source_revision].to_s.empty? ? "working" : @options[:source_revision]
  end

  def load_detail(rel_path)
    path = File.join(@tied_base, rel_path)
    return nil unless File.file?(path)

    YAML.safe_load(File.read(path, encoding: "UTF-8"), aliases: true)
  end

  def token_detail_path(token)
    case token
    when /^REQ-/
      "requirements/#{token}.yaml"
    when /^ARCH-/
      "architecture-decisions/#{token}.yaml"
    when /^IMPL-/
      "implementation-decisions/#{token}.yaml"
    end
  end

  def linked_tokens
    req = load_detail(token_detail_path(request_token))
    abort("Request token detail missing: #{request_token}") unless req.is_a?(Hash)

    req_body = req[request_token] || req.values.first
    trace = req_body["traceability"] || {}
    arch = Array(trace["architecture"] || req_body.dig("cross_references", "architecture"))
    impl = Array(trace["implementation"] || req_body.dig("cross_references", "implementation"))
    tokens = [request_token] + arch + impl
    if @options[:impl_token]
      tokens = [request_token, @options[:impl_token]]
    end
    tokens.uniq
  end

  def claim_id_for(text, source)
    Digest::SHA256.hexdigest("#{source}\0#{text}")[0, 16]
  end

  def build_claim_surface
    claims = []
    linked_tokens.each do |token|
      rel = token_detail_path(token)
      detail = load_detail(rel)
      next unless detail.is_a?(Hash)

      body = detail[token] || detail.values.first
      next unless body.is_a?(Hash)

      if token.start_with?("REQ-")
        Array(body["satisfaction_criteria"]).each do |row|
          text = row.is_a?(Hash) ? row["criterion"].to_s : row.to_s
          next if text.strip.empty?

          claims << {
            "id" => claim_id_for(text, token),
            "text" => text,
            "source" => token,
            "scope" => request_token,
          }
        end
      elsif token.start_with?("ARCH-")
        rationale = body.dig("rationale", "decision") || body["description"]
        if rationale.to_s.strip.length.positive?
          claims << {
            "id" => claim_id_for(rationale.to_s, token),
            "text" => rationale.to_s,
            "source" => token,
            "scope" => request_token,
          }
        end
      elsif token.start_with?("IMPL-")
        desc = body["description"].to_s
        if desc.strip.length.positive?
          claims << {
            "id" => claim_id_for(desc, token),
            "text" => desc,
            "source" => token,
            "scope" => request_token,
          }
        end
        pseudo = File.join(@tied_base, "implementation-decisions", "#{token}-pseudocode.md")
        if File.file?(pseudo)
          claims << {
            "id" => claim_id_for("pseudo-code sidecar exists", token),
            "text" => "IMPL pseudo-code sidecar is present for #{token}.",
            "source" => token,
            "scope" => request_token,
          }
        end
      end
    end

    claims << {
      "id" => claim_id_for("runtime correctness", "slice-boundary"),
      "text" => "Runtime behavior matches production deployment configuration.",
      "source" => "slice-boundary",
      "scope" => request_token,
      "requiresRuntimeProof" => true,
    }

    claims << {
      "id" => claim_id_for("bounded static search gap", "slice-boundary"),
      "text" => "External deployment manifest matches declared service endpoints.",
      "source" => "slice-boundary-unsettled",
      "scope" => request_token,
      "materialityHint" => "unsettled-regression",
    }

    claims.uniq! { |row| row["id"] }
    claims.sort_by! { |row| row["id"] }

    {
      "schemaVersion" => "claim-surface.v1",
      "revision" => Digest::SHA256.hexdigest(JSON.generate(claims))[0, 16],
      "sourceRevision" => source_revision,
      "requestToken" => request_token,
      "claims" => claims,
    }
  end

  def build_evidence_stubs(surface)
    surface["claims"].map do |claim|
      stub = {
        "claimId" => claim["id"],
        "proofBoundary" => claim["requiresRuntimeProof"] ? "out_of_scope_static_slice" : "static_analysis",
      }
      unless claim["requiresRuntimeProof"]
        token = claim["source"]
        if token == "slice-boundary-unsettled"
          stub["path"] = "tied/nonexistent-evidence-for-unsettled-regression.yaml"
        else
          rel = token_detail_path(token)
          if rel
            tied_rel = rel.start_with?("tied/") ? rel : File.join("tied", rel)
            stub["path"] = tied_rel
          end
          if token&.start_with?("IMPL-")
            stub["pseudoCodeRef"] = File.join("tied", "implementation-decisions", "#{token}-pseudocode.md")
          end
        end
      end
      stub
    end
  end

  def build_provenance(surface)
    {
      "generator" => "build_claims_evidence_from_tied.rb",
      "requestToken" => request_token,
      "sourceRevision" => source_revision,
      "claimCount" => surface["claims"].length,
      "generatedAt" => Time.now.utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
  end

  def write_expected_dispositions(out, surface, stubs)
    rows = surface["claims"].map do |claim|
      stub = stubs.find { |entry| entry["claimId"] == claim["id"] }
      disposition = if claim["requiresRuntimeProof"]
                      "not_examined"
                    elsif stub && stub["path"]
                      "shown"
                    else
                      "unsettled"
                    end
      { "claimId" => claim["id"], "disposition" => disposition }
    end
    File.write(
      File.join(out, "expected-dispositions.yaml"),
      rows.map { |row| "- claimId: #{row['claimId']}\n  disposition: #{row['disposition']}\n" }.join,
      encoding: "UTF-8",
    )
  end

  def write_json(path, value)
    File.write(path, "#{JSON.pretty_generate(value)}\n", encoding: "UTF-8")
  end
end

options = {}
parser = OptionParser.new do |opts|
  opts.banner = "Usage: build_claims_evidence_from_tied.rb [options]"
  opts.on("--project-root PATH", "Absolute audited project root") { |v| options[:project_root] = v }
  opts.on("--tied-base-path PATH", "TIED base path (default project_root/tied)") { |v| options[:tied_base_path] = v }
  opts.on("--request-token TOKEN", "Request REQ token (default #{DEFAULT_REQUEST_TOKEN})") { |v| options[:request_token] = v }
  opts.on("--impl-token TOKEN", "Optional IMPL scope filter") { |v| options[:impl_token] = v }
  opts.on("--block-id ID", "Optional block scope filter (reserved)") { |v| options[:block_id] = v }
  opts.on("--source-revision REV", "Source revision label") { |v| options[:source_revision] = v }
  opts.on("--output-dir PATH", "Write claim-surface.v1.json and evidence stubs") { |v| options[:output_dir] = v }
end
parser.parse!

BuildClaimsEvidenceFromTied.new(options).run
