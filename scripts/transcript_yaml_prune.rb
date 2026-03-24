# frozen_string_literal: true

# Shared post-order prune for transcript/hook YAML trees (used by dedupe_transcript_yaml.rb and .cursor/hooks/log.rb).
module TranscriptYamlPrune
  module_function

  # Post-order prune: recurse into values first so parent keys mapping to now-empty {} or [] are removed.
  # Each rule removes the entire key-value pair via Hash#delete (never leaves the key with a cleared value).
  # Returns count of keys deleted from all visited hashes.
  def prune_tree!(node)
    removed = 0
    case node
    when Hash
      node.each_value { |v| removed += prune_tree!(v) }
      drop = []
      node.each do |key, val|
        k = key.to_s
        drop << key if k == 'conversation_id'
        drop << key if k == 'kind' && val == 'unknown'
        drop << key if val.nil? || val == '' || val == [] || val == {}
      end
      drop.uniq.each do |key|
        node.delete(key)
        removed += 1
      end
    when Array
      node.each { |elem| removed += prune_tree!(elem) }
    end
    removed
  end

  def prune_records!(records)
    return 0 unless records.is_a?(Array)

    total = 0
    records.each { |r| total += prune_tree!(r) }
    total
  end
end
