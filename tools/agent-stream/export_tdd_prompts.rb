#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative 'lib/atdd_export_tdd_prompts'

# Defaults: repo docs/tdd_development_loop.yaml and generated prompts under this tool dir
yaml = ARGV[0] || File.expand_path('../../docs/tdd_development_loop.yaml', __dir__)
out_dir = ARGV[1] || File.expand_path('prompts/tdd/generated', __dir__)

count = AtddExportTddPrompts.export_from_yaml(yaml, out_dir)

warn "Wrote #{count} files to #{out_dir}"
