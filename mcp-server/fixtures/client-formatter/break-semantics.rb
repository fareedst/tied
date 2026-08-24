#!/usr/bin/env ruby
# frozen_string_literal: true

# [REQ-TIED_YAML_STYLE_CONFIGURATION] Intentionally changes scalar typing for semantic drift tests.
path = ARGV[-1]
content = File.read(path)
updated = content.gsub(": true\n", ': "true"' + "\n")
                 .gsub(": false\n", ': "false"' + "\n")
                 .gsub(": 42\n", ': "42"' + "\n")
                 .gsub(": null\n", ': "null"' + "\n")
File.write(path, updated)
