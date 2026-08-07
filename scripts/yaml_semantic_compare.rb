#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"
require "date"
require "set"

# Safely loads YAML files into Ruby values for semantic comparison.
class YamlLoader
  PERMITTED_CLASSES = [Date, Time, Symbol].freeze

  def self.load(path)
    load_content(File.binread(path), filename: path)
  end

  def self.load_content(raw, filename: "<memory>")
    content = raw.dup.force_encoding(Encoding::UTF_8)
    unless content.valid_encoding?
      content = raw.dup.force_encoding(Encoding::ISO_8859_1).encode(Encoding::UTF_8)
    end

    parse_documents(content, filename: filename)
  end

  def self.parse_documents(content, filename:)
    documents =
      if YAML.respond_to?(:safe_load_stream)
        YAML.safe_load_stream(
          content,
          permitted_classes: PERMITTED_CLASSES,
          permitted_symbols: [],
          aliases: true,
          filename: filename
        )
      else
        [
          YAML.safe_load(
            content,
            permitted_classes: PERMITTED_CLASSES,
            permitted_symbols: [],
            aliases: true,
            filename: filename
          )
        ]
      end

    documents = [nil] if documents.empty?
    documents.length == 1 ? documents.first : documents
  end
  private_class_method :parse_documents
end

# Produces stable comparison keys for nested YAML values.
class CanonicalValue
  def initialize(unordered_arrays: false)
    @unordered_arrays = unordered_arrays
  end

  def key(value)
    Marshal.dump(normalize(value))
  end

  private

  def normalize(value)
    case value
    when Hash
      normalized_pairs = value.map do |key, child_value|
        [normalize(key), normalize(child_value)]
      end

      ["Hash", normalized_pairs.sort_by { |key, _child_value| Marshal.dump(key) }]
    when Array
      normalized_items = value.map { |item| normalize(item) }
      normalized_items = normalized_items.sort_by { |item| Marshal.dump(item) } if @unordered_arrays
      ["Array", normalized_items]
    else
      [value.class.name, value]
    end
  end
end

# Recursively compares Ruby values produced from YAML and records path-level differences.
class DifferenceWalker
  def initialize(unordered_arrays: false)
    @unordered_arrays = unordered_arrays
    @canonical_value = CanonicalValue.new(unordered_arrays: unordered_arrays)
  end

  def differences(left, right)
    result = []
    compare(left, right, "$", result)
    result
  end

  private

  def compare(left, right, path, result, ordered_key: false)
    if left.class != right.class
      result << "#{path}: type differs: left=#{type_and_value(left)}, right=#{type_and_value(right)}"
      return
    end

    case left
    when Hash
      compare_hashes(left, right, path, result)
    when Array
      if @unordered_arrays && !ordered_key
        compare_unordered_arrays(left, right, path, result)
      else
        compare_ordered_arrays(left, right, path, result)
      end
    else
      return if left == right

      result << "#{path}: left=#{format_value(left)}, right=#{format_value(right)}"
    end
  end

  def compare_hashes(left, right, path, result)
    left_keys = left.keys.to_set
    right_keys = right.keys.to_set

    (left_keys - right_keys).to_a.sort_by { |key| sort_key(key) }.each do |key|
      result << "#{hash_path(path, key)}: missing from right; left=#{format_value(left[key])}"
    end

    (right_keys - left_keys).to_a.sort_by { |key| sort_key(key) }.each do |key|
      result << "#{hash_path(path, key)}: missing from left; right=#{format_value(right[key])}"
    end

    (left_keys & right_keys).to_a.sort_by { |key| sort_key(key) }.each do |key|
      compare(
        left[key],
        right[key],
        hash_path(path, key),
        result,
        ordered_key: ordered_list_key?(key)
      )
    end
  end

  def ordered_list_key?(key)
    key_text = key.to_s
    key_text.match?(/\A(?:order|order_.+|.+_order|.+_order_.+)\z/)
  end

  def compare_ordered_arrays(left, right, path, result)
    max_length = [left.length, right.length].max

    (0...max_length).each do |index|
      child_path = "#{path}[#{index}]"

      if index >= left.length
        result << "#{child_path}: missing from left; right=#{format_value(right[index])}"
      elsif index >= right.length
        result << "#{child_path}: missing from right; left=#{format_value(left[index])}"
      else
        compare(left[index], right[index], child_path, result)
      end
    end
  end

  def compare_unordered_arrays(left, right, path, result)
    left_groups = group_array_values(left)
    right_groups = group_array_values(right)
    all_keys = (left_groups.keys.to_set | right_groups.keys.to_set).to_a.sort

    all_keys.each do |key|
      left_values = left_groups.fetch(key, [])
      right_values = right_groups.fetch(key, [])
      next if left_values.length == right_values.length

      if left_values.length > right_values.length
        extra_count = left_values.length - right_values.length
        result << "#{path}: #{pluralize(extra_count, "extra instance")} only in left: #{format_value(left_values.first)}"
      else
        extra_count = right_values.length - left_values.length
        result << "#{path}: #{pluralize(extra_count, "extra instance")} only in right: #{format_value(right_values.first)}"
      end
    end
  end

  def group_array_values(values)
    values.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |value, groups|
      groups[@canonical_value.key(value)] << value
    end
  end

  def hash_path(path, key)
    case key
    when String
      key.match?(/\A[A-Za-z_][A-Za-z0-9_]*\z/) ? "#{path}.#{key}" : "#{path}[#{key.inspect}]"
    when Symbol
      name = key.to_s
      name.match?(/\A[A-Za-z_][A-Za-z0-9_]*\z/) ? "#{path}.#{name}" : "#{path}[#{key.inspect}]"
    else
      "#{path}[#{key.inspect}]"
    end
  end

  def sort_key(value)
    [value.class.name, value.inspect]
  end

  def pluralize(count, singular)
    count == 1 ? "1 #{singular}" : "#{count} #{singular}s"
  end

  def type_and_value(value)
    "#{value.class}(#{format_value(value)})"
  end

  def format_value(value)
    text = value.inspect
    text.length > 180 ? "#{text[0, 177]}..." : text
  end
end

# Facade for comparing parsed YAML values.
class YamlSemanticCompare
  CompareResult = Struct.new(:ok, :differences, keyword_init: true)

  def self.compare(left, right, unordered_arrays: false)
    differences = DifferenceWalker.new(unordered_arrays: unordered_arrays).differences(left, right)
    CompareResult.new(ok: differences.empty?, differences: differences)
  end
end
