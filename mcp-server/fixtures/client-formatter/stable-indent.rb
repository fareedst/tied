#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

# [REQ-TIED_YAML_STYLE_CONFIGURATION] Deterministic indentation restyle; semantically equivalent.
path = ARGV[-1]
content = File.read(path)
data = YAML.safe_load(content, permitted_classes: [Symbol], aliases: true, filename: path)
File.write(path, YAML.dump(data, line_width: -1))
