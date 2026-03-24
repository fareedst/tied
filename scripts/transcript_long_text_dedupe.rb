# frozen_string_literal: true

# Shared long-text dedupe for Cursor hook YAML (see scripts/dedupe_transcript_yaml.rb).
#
# Any hash in the document tree that has a `content` key is considered (depth-first
# preorder). Digest: first 16 hex characters of SHA256 over the UTF-8 string.

require 'digest'

module TranscriptLongTextDedupe
  LONG_LINE_THRESHOLD = 3
  DIGEST_HEX_CHARS = 16

  LongTextSlot = Struct.new(:kind, :node) do
    def long_string
      case kind
      when :array_item then node['text']
      when :scalar_content then node['content']
      when :content_value then node['value']
      end
    end

    def apply_canonical!(digest)
      case kind
      when :array_item
        node['digest'] = digest
      when :scalar_content
        node['digest'] = digest
      when :content_value
        node['digest'] = digest
      end
    end

    def apply_duplicate!(digest)
      case kind
      when :array_item
        node['digest'] = digest
        node.delete('text')
      when :scalar_content
        node['digest'] = digest
        node.delete('content')
      when :content_value
        node['digest'] = digest
        node.delete('value')
      end
    end
  end

  module_function

  def text_digest(text)
    Digest::SHA256.hexdigest(text)[0, DIGEST_HEX_CHARS]
  end

  def long_text?(text)
    text.is_a?(String) && text.lines.size >= LONG_LINE_THRESHOLD
  end

  # Depth-first preorder: yield every Hash that has a `content` key before recursing
  # into its values (so outer `content` slots are ordered before nested ones).
  def each_content_parent(records)
    return enum_for(:each_content_parent, records) unless block_given?

    walk = lambda do |node|
      case node
      when Hash
        yield(node) if node.key?('content')
        node.each_value { |v| walk.call(v) }
      when Array
        node.each { |e| walk.call(e) }
      end
    end

    return unless records.is_a?(Array)

    records.each { |r| walk.call(r) }
  end

  # Array items with type text under any `content` array (for validation).
  def each_text_content_item(records)
    return enum_for(:each_text_content_item, records) unless block_given?

    each_content_parent(records) do |parent|
      content = parent['content']
      next unless content.is_a?(Array)

      content.each do |item|
        next unless item.is_a?(Hash) && item['type'] == 'text'

        yield item
      end
    end
  end

  def collect_long_text_slots_in_order(records)
    list = []
    each_content_parent(records) do |parent|
      content = parent['content']

      if content.is_a?(Array)
        content.each do |item|
          next unless item.is_a?(Hash) && item['type'] == 'text'

          text = item['text']
          list << LongTextSlot.new(:array_item, item) if long_text?(text)
        end
      elsif content.is_a?(String) && long_text?(content)
        list << LongTextSlot.new(:scalar_content, parent)
      elsif content.is_a?(Hash) && long_text?(content['value'])
        list << LongTextSlot.new(:content_value, content)
      end
    end
    list
  end

  # Mutates +records+ tree. +registry+ maps full long string => digest (canonical rows only).
  # Used by batch dedupe with a fresh {} and by hook logging with a persisted registry.
  def dedupe_long_texts_with_registry!(records, registry)
    stats = { long_items_seen: 0, canonical_with_digest: 0, duplicates_stripped: 0 }
    collect_long_text_slots_in_order(records).each do |slot|
      text = slot.long_string
      stats[:long_items_seen] += 1
      digest = text_digest(text)
      if registry.key?(text)
        slot.apply_duplicate!(registry[text])
        stats[:duplicates_stripped] += 1
      else
        registry[text] = digest
        slot.apply_canonical!(digest)
        stats[:canonical_with_digest] += 1
      end
    end
    stats
  end

  def dedupe_long_texts!(records)
    dedupe_long_texts_with_registry!(records, {})
  end
end
