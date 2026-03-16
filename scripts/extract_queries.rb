#!/usr/bin/env ruby
# frozen_string_literal: true

require 'date'
require 'set'
require 'yaml'

def extract_queries(input)
  records = YAML.safe_load(input, permitted_classes: [Date, Time], aliases: true)
  return [] unless records.is_a?(Array)

  queries = []
  seen = Set.new

  records.each do |record|
    next unless record.is_a?(Hash)

    transcripts = record['transcript']
    next unless transcripts.is_a?(Array)

    transcripts.each do |entry|
      next unless entry.is_a?(Hash)

      content = entry.dig('message', 'content')
      next unless content.is_a?(Array)

      content.each do |item|
        next unless item.is_a?(Hash) && item['type'] == 'text'

        text = item['text']
        next unless text.is_a?(String)

        text.scan(%r{<user_query>(.*?)</user_query>}m) do |match|
          body = match[0].strip
          next if body.empty?
          next if seen.include?(body)

          seen.add(body)
          queries << body
        end
      end
    end
  end

  queries
end

query_num = 0

extract_queries(ARGF.read).each do |q|
  query_num += 1
  puts "--- Query #{query_num} ---"
  puts q
  puts
end
