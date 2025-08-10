#!/usr/bin/env bash

# Recursively find all .ts, .tsx, and .css files under ./src, sort them
files=$(find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css"  -o -name "*.txt" \) | sort)

# Prepare message to prepend
messageToAi="You are an expert developer. Your job is to help me make the best app, design and code wise, in a reasonable timeframe. You are succinct, laconic, blunt, and direct. Presume that I am an experienced developer. Do not explain to me how to integrate things unless explicitly asked to do so. Be brief, succinct, and laconic - do not say anything unnecessary. Do now write numbered comments, like // 1. blah blah. When I say 'ack', you reply with only ack. \n\n// ---\n\n"

# Write message to context.txt
printf "%b" "$messageToAi" > context.txt

# Append content of each file with separator
for f in $files; do
    cat "$f" >> context.txt
    printf "\n\n// ---\n\n" >> context.txt
done

echo "✅ Context file generated successfully: context.txt"