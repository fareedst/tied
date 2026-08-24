#!/usr/bin/env ruby
# frozen_string_literal: true

# [REQ-TIED_YAML_STYLE_CONFIGURATION] Appends a comment on every invocation to break idempotence.
path = ARGV[-1]
File.write(path, File.read(path) + "# formatted\n")
