#!/usr/bin/env ruby
# frozen_string_literal: true

# [REQ-TIED_YAML_STYLE_CONFIGURATION] Emits invalid YAML for fail-closed rejection tests.
path = ARGV[-1]
File.write(path, "{{invalid yaml")
