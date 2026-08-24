#!/usr/bin/env ruby
# frozen_string_literal: true

# [IMPL-TIED_FILES] [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY]
# [REQ-TIED_SETUP] [REQ-TIED_ADVERSARIAL_INQUIRY]
# How: Emit normalized graph and fidelity JSON for Mode A inquiry from TIED tokens,
# declared test/production paths, and optional declarative build-config (Go / language-neutral).

require "digest"
require "fileutils"
require "json"
require "optparse"
require "tmpdir"
require "yaml"

class BuildAdversarialInquiryFromTied
  MODE_A_SCRIPT = File.expand_path("build_adversarial_inquiry_mode_a.rb", __dir__)

  def self.project_id_from_tied_base(tied_base_path)
    Digest::SHA256.hexdigest(File.expand_path(tied_base_path))[0, 16]
  end

  def self.digest16(value)
    Digest::SHA256.hexdigest(value.to_s)[0, 16]
  end

  def initialize(options)
    @options = options
  end

  def run
    config = load_build_config
    merge_cli_with_config(config)
    validate_required!(config)

    graph = build_graph(config)
    fidelity = build_fidelity(config)
    provenance = build_provenance(config)

    write_outputs(graph, fidelity, provenance) if @options[:output_dir]

    if @options[:emit_mode_a]
      emit_mode_a_payload(graph, fidelity, provenance)
    else
      puts JSON.pretty_generate(
        {
          "graph" => graph,
          "fidelity" => fidelity,
          "provenance" => provenance,
        },
      )
    end
  end

  private

  def load_build_config
    return {} unless @options[:build_config]

    path = @options[:build_config]
    abort("Build config not found: #{path}") unless File.file?(path)

    doc = YAML.safe_load(File.read(path, encoding: "UTF-8"), aliases: true)
    abort("Build config must be a mapping: #{path}") unless doc.is_a?(Hash)

    doc
  end

  def merge_cli_with_config(config)
    config["project_root"] = @options[:project_root] if @options[:project_root]
    config["tied_base_path"] = @options[:tied_base_path] if @options[:tied_base_path]
    config["request_token"] = @options[:request_token] if @options[:request_token]
    config["block_id"] = @options[:block_id] if @options[:block_id]
    config["impl_token"] = @options[:impl_token] if @options[:impl_token]
    config["source_revision"] ||= config["sourceRevision"]
    config["source_revision"] = @options[:source_revision] if @options[:source_revision]

    config["test_paths"] = Array(config["test_paths"]) + Array(@options[:test_paths])
    config["test_paths"].uniq!
    config["production_path"] = @options[:production_path] if @options[:production_path]

    config["scope"] = Array(config["scope"]) + Array(@options[:scope])
    config["scope"].uniq!

    config["project_id"] = project_id(config)
  end

  def validate_required!(config)
    missing = []
    missing << "project_root" if config["project_root"].to_s.empty?
    missing << "tied_base_path" if config["tied_base_path"].to_s.empty?
    missing << "request_token" if config["request_token"].to_s.empty?
    missing << "block_id" if config["block_id"].to_s.empty?
    missing << "source_revision" if config["source_revision"].to_s.empty?

    has_fixture_payload = config["graph"].is_a?(Hash) && config["fidelity"].is_a?(Hash)
    unless has_fixture_payload
      missing << "test_paths" if Array(config["test_paths"]).empty?
      missing << "production_path" if config["production_path"].to_s.empty?
    end

    abort("Missing required inputs: #{missing.join(", ")}") unless missing.empty?

    project_root = File.expand_path(config["project_root"])
    abort("Project root does not exist: #{project_root}") unless File.directory?(project_root)

    tied_base = File.expand_path(config["tied_base_path"])
    abort("TIED base path does not exist: #{tied_base}") unless File.directory?(tied_base)
  end

  def project_id(config)
    self.class.project_id_from_tied_base(config["tied_base_path"])
  end

  def build_graph(config)
    if config["graph"].is_a?(Hash)
      graph = deep_dup(config["graph"])
      graph["projectId"] = config["project_id"]
      apply_source_revision(graph, config["source_revision"])
      return graph
    end

    block_id = config["block_id"]
    impl_token, block_name = parse_block_id(block_id)
    config["impl_token"] ||= impl_token
    config["block_name"] ||= block_name

    criterion = config.fetch("criterion") { default_criterion(config) }
    architecture_constraint_id = criterion.fetch("architecture_constraint_id") do
      "constraint-#{config['request_token'].sub(/^REQ-/, '').downcase}"
    end

    evidence_loci = Array(config["evidence_loci"])
    if evidence_loci.empty?
      evidence_loci = build_evidence_loci_from_paths(config, block_id)
    else
      evidence_loci = evidence_loci.map do |row|
        row = row.transform_keys(&:to_s)
        row["blockId"] ||= block_id
        row["sourceRevision"] ||= config["source_revision"]
        row
      end
    end

    adversarial_cases = Array(config["adversarial_cases"]).map do |entry|
      case entry
      when String
        { "id" => entry, "blockId" => block_id }
      when Hash
        entry.transform_keys(&:to_s).tap do |row|
          row["blockId"] ||= block_id
        end
      else
        abort("Unsupported adversarial_cases entry: #{entry.inspect}")
      end
    end
    adversarial_cases = default_adversarial_cases(block_id) if adversarial_cases.empty?

    {
      "projectId" => config["project_id"],
      "criteria" => [
        {
          "identity" => {
            "id" => criterion.fetch("id"),
            "kind" => "criterion",
            "derivation" => criterion.fetch("derivation", "explicit"),
            "revision" => criterion.fetch("revision"),
            "sourceRevision" => config["source_revision"],
          },
          "architectureConstraintIds" => [architecture_constraint_id],
        },
      ],
      "architectureConstraints" => [
        {
          "id" => architecture_constraint_id,
          "implementationBlockIds" => [block_id],
        },
      ],
      "implementationBlocks" => [
        {
          "identity" => {
            "id" => block_id,
            "kind" => "block",
            "name" => config["block_name"],
            "derivation" => config.fetch("block_derivation", "content"),
            "revision" => config.fetch("block_revision") { self.class.digest16(block_id) },
            "sourceRevision" => config["source_revision"],
          },
        },
      ],
      "evidenceLoci" => evidence_loci,
      "adversarialCases" => adversarial_cases,
    }
  end

  def build_fidelity(config)
    if config["fidelity"].is_a?(Hash)
      fidelity = deep_dup(config["fidelity"])
      block_revision = fidelity["blockRevision"] || config.fetch("block_revision") { self.class.digest16(config["block_id"]) }
      fidelity["blockRevision"] = block_revision
      return fidelity
    end

    block_revision = config.fetch("block_revision") { self.class.digest16(config["block_id"]) }
    specification = Array(config["specification"])
    specification = default_specification(config) if specification.empty?

    test_evidence = Array(config["test_evidence"])
    test_evidence = build_test_evidence_from_paths(config, block_revision) if test_evidence.empty?

    production_evidence = Array(config["production_evidence"])
    production_evidence = build_production_evidence_from_paths(config, block_revision) if production_evidence.empty?

    {
      "blockRevision" => block_revision,
      "specification" => specification.map { |row| normalize_statement_row(row) },
      "testEvidence" => test_evidence.map { |row| normalize_evidence_row(row, block_revision) },
      "productionEvidence" => production_evidence.map { |row| normalize_evidence_row(row, block_revision) },
    }
  end

  def build_provenance(config)
    if config["provenance"].is_a?(Hash)
      return deep_dup(config["provenance"])
    end

    {
      "builder" => "build_adversarial_inquiry_from_tied.rb",
      "request_token" => config["request_token"],
      "block_id" => config["block_id"],
      "project_id" => config["project_id"],
      "source_revision" => config["source_revision"],
      "tied_base_path" => File.expand_path(config["tied_base_path"]),
      "test_paths" => Array(config["test_paths"]),
      "production_path" => config["production_path"],
      "build_config" => @options[:build_config],
    }.compact
  end

  def build_evidence_loci_from_paths(config, block_id)
    loci = []
    Array(config["test_paths"]).each_with_index do |path, index|
      location = repo_relative_location(config["project_root"], path)
      loci << {
        "id" => "test-#{index + 1}",
        "blockId" => block_id,
        "kind" => "test",
        "location" => location,
        "sourceRevision" => config["source_revision"],
      }
    end

    if config["production_path"]
      loci << {
        "id" => "prod-1",
        "blockId" => block_id,
        "kind" => "production",
        "location" => repo_relative_location(config["project_root"], config["production_path"]),
        "sourceRevision" => config["source_revision"],
      }
    end

    loci
  end

  def build_test_evidence_from_paths(config, block_revision)
    Array(config["test_paths"]).each_with_index.map do |path, index|
      location = repo_relative_location(config["project_root"], path)
      {
        "id" => "test-path-#{index + 1}",
        "direction" => "test",
        "statementId" => "stmt-path-#{index + 1}",
        "kind" => "behavior",
        "value" => "Declared test path #{location}",
        "order" => index + 1,
        "reliable" => true,
        "source" => { "location" => location },
        "provenance" => "declared-path",
        "blockRevision" => block_revision,
      }
    end
  end

  def build_production_evidence_from_paths(config, block_revision)
    return [] if config["production_path"].to_s.empty?

    location = repo_relative_location(config["project_root"], config["production_path"])
    [
      {
        "id" => "prod-path-1",
        "direction" => "production",
        "statementId" => "stmt-path-prod",
        "kind" => "behavior",
        "value" => "Declared production path #{location}",
        "order" => 1,
        "reliable" => true,
        "source" => { "location" => location },
        "provenance" => "declared-path",
        "blockRevision" => block_revision,
      },
    ]
  end

  def default_criterion(config)
    req = config["request_token"]
    {
      "id" => "#{req}#criterion-1",
      "revision" => "criterion-rev-#{req.sub(/^REQ-/, '').downcase}",
      "architecture_constraint_id" => "constraint-#{req.sub(/^REQ-/, '').downcase}",
    }
  end

  def default_adversarial_cases(block_id)
    %w[CE-001 CE-002 CE-003].map { |id| { "id" => id, "blockId" => block_id } }
  end

  def default_specification(config)
    Array(config["test_paths"]).each_with_index.map do |path, index|
      location = repo_relative_location(config["project_root"], path)
      {
        "id" => "stmt-path-#{index + 1}",
        "kind" => "behavior",
        "value" => "Behavior covered by #{location}",
        "order" => index + 1,
      }
    end
  end

  def normalize_statement_row(row)
    row.transform_keys(&:to_s).tap do |normalized|
      normalized["id"] ||= "stmt-#{normalized['order']}"
    end
  end

  def normalize_evidence_row(row, block_revision)
    row.transform_keys(&:to_s).tap do |normalized|
      normalized["blockRevision"] ||= block_revision
      normalized["source"] = normalized["source"].transform_keys(&:to_s) if normalized["source"].is_a?(Hash)
    end
  end

  def parse_block_id(block_id)
    parts = block_id.split("#", 3)
    abort("Invalid block_id (expected IMPL-TOKEN#NAME#digest): #{block_id}") if parts.length < 2
    [parts[0], parts[1]]
  end

  def repo_relative_location(project_root, path)
    expanded = File.expand_path(path, project_root)
    relative = expanded.delete_prefix("#{File.expand_path(project_root)}/")
    relative == expanded ? path.to_s : relative
  end

  def apply_source_revision(graph, source_revision)
    graph["criteria"]&.each do |row|
      row["identity"]["sourceRevision"] = source_revision if row.dig("identity", "sourceRevision")
    end
    graph["implementationBlocks"]&.each do |row|
      row["identity"]["sourceRevision"] = source_revision if row.dig("identity", "sourceRevision")
    end
    graph["evidenceLoci"]&.each do |row|
      row["sourceRevision"] = source_revision if row["sourceRevision"]
    end
    graph
  end

  def write_outputs(graph, fidelity, provenance)
    dir = File.expand_path(@options[:output_dir])
    FileUtils.mkdir_p(dir)
    write_json(File.join(dir, "graph.json"), graph)
    write_json(File.join(dir, "fidelity.json"), fidelity)
    write_json(File.join(dir, "provenance.json"), provenance)
  end

  def write_json(path, payload)
    File.write(path, JSON.pretty_generate(payload) + "\n", encoding: "UTF-8")
  end

  def emit_mode_a_payload(graph, fidelity, provenance)
    require "open3"
    scope = Array(@options[:scope])
    abort("emit_mode_a requires at least one --scope") if scope.empty?

    Dir.mktmpdir("mode-a-from-tied-") do |tmpdir|
      graph_path = File.join(tmpdir, "graph.json")
      fidelity_path = File.join(tmpdir, "fidelity.json")
      provenance_path = File.join(tmpdir, "provenance.json")
      write_json(graph_path, graph)
      write_json(fidelity_path, fidelity)
      write_json(provenance_path, provenance)

      cmd = [
        "ruby", MODE_A_SCRIPT,
        "--graph", graph_path,
        "--fidelity", fidelity_path,
        "--provenance", provenance_path,
        "--project-root", @options[:project_root],
        "--request-token", @options[:request_token],
        "--run-id", @options[:run_id],
        "--phase", @options[:phase],
        "--policy", @options[:policy],
        *scope.flat_map { |item| ["--scope", item] },
      ]
      stdout, stderr, status = Open3.capture3(*cmd)
      unless status.success?
        warn(stderr) unless stderr.empty?
        abort("Mode A builder failed with exit #{status.exitstatus}")
      end
      print stdout
    end
  end

  def deep_dup(value)
    JSON.parse(JSON.generate(value))
  end
end

options = {
  test_paths: [],
  scope: [],
  policy: "advisory",
}
parser = OptionParser.new do |opts|
  opts.banner = "Usage: build_adversarial_inquiry_from_tied.rb [options]"
  opts.on("--project-root PATH", "Absolute audited project root") { |value| options[:project_root] = value }
  opts.on("--tied-base-path PATH", "TIED base path (default: project_root/tied)") do |value|
    options[:tied_base_path] = value
  end
  opts.on("--request-token TOKEN", "Request REQ token") { |value| options[:request_token] = value }
  opts.on("--impl-token TOKEN", "Implementation IMPL token") { |value| options[:impl_token] = value }
  opts.on("--block-id ID", "Scoped block id (IMPL-TOKEN#NAME#digest)") { |value| options[:block_id] = value }
  opts.on("--test-path PATH", "Repository-relative test path (repeatable)") { |value| options[:test_paths] << value }
  opts.on("--production-path PATH", "Repository-relative production path") { |value| options[:production_path] = value }
  opts.on("--output-dir PATH", "Write graph.json, fidelity.json, provenance.json") { |value| options[:output_dir] = value }
  opts.on("--build-config FILE", "Declarative mapping YAML (interim v1)") { |value| options[:build_config] = value }
  opts.on("--source-revision REV", "Source revision label for graph/fidelity") { |value| options[:source_revision] = value }
  opts.on("--scope ID", "Mode A scope id (repeatable; required with --emit-mode-a)") { |value| options[:scope] << value }
  opts.on("--emit-mode-a", "Pipe assembled output through build_adversarial_inquiry_mode_a.rb") { options[:emit_mode_a] = true }
  opts.on("--run-id ID", "Mode A run id (required with --emit-mode-a)") { |value| options[:run_id] = value }
  opts.on("--phase PHASE", %w[pre_implementation verification close_out], "Mode A phase") { |value| options[:phase] = value }
  opts.on("--policy POLICY", %w[advisory strict-candidate strict-approved], "Mode A gate policy") do |value|
    options[:policy] = value
  end
end
parser.parse!

if options[:project_root] && !options[:tied_base_path]
  options[:tied_base_path] = File.join(File.expand_path(options[:project_root]), "tied")
end

if options[:emit_mode_a]
  %i[run_id phase project_root request_token].each do |key|
    abort("Missing --#{key.to_s.tr("_", "-")} for --emit-mode-a") if options[key].to_s.empty?
  end
end

BuildAdversarialInquiryFromTied.new(options).run
