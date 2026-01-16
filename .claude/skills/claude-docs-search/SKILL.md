---
name: claude-docs-search
description: Search local Claude platform documentation for Claude API, SDKs, models, prompt engineering, tool use, and building with Claude. Use for Claude API features, messages API, tool use API, computer use, prompt caching, batch processing, vision, PDFs, embeddings, Agent SDK, MCP connector, models, pricing, rate limits, or any Claude platform capability. Do NOT use for Claude Code CLI-specific questions (subagents, workflows, skills, hooks, plugins, CLI settings) - use claude-code-docs-search instead.
allowed-tools: Read, Grep, Glob
---

# Claude Platform Documentation Search

Search `docs/claude/` for questions about the Claude API, SDKs, models, and platform capabilities.

## Scope

**This skill covers**: Claude API, Python/TypeScript/Java/Go SDKs, models, pricing, prompt engineering, tool use API, computer use, vision, PDFs, streaming, batch processing, Agent SDK, MCP connector, rate limits, guardrails.

**NOT in scope** (use `claude-code-docs-search` instead): Claude Code CLI features, subagents, workflows, skills, hooks, plugins, CLI settings, headless mode, IDE extensions, slash commands.

## Instructions

1. **Understand the structure** - Docs are organized hierarchically:
   - `about-claude/` - Models, pricing, glossary, use case guides
   - `agent-sdk/` - Agent SDK for building custom agents
   - `agents-and-tools/` - Tool use API, MCP connector, agent skills
   - `api/` - API reference (REST + SDK docs)
   - `build-with-claude/` - Messages, streaming, vision, PDFs, prompt engineering
   - `test-and-evaluate/` - Testing, evaluation, guardrails

2. **Search for terms** - Use grep within `docs/claude/`:
   ```
   Grep pattern="tool use" path="docs/claude/"
   Grep pattern="streaming" path="docs/claude/"
   ```

3. **Read relevant files**:
   ```
   Read file_path="docs/claude/agents-and-tools/tool-use/overview.md"
   Read file_path="docs/claude/build-with-claude/streaming.md"
   ```

4. **Follow links** - Map remote URLs to local files:
   - `https://platform.claude.com/docs/en/...` --> `docs/claude/....md`
   - `https://code.claude.com/docs/...` --> `docs/claude-code/...` (use `claude-code-docs-search`)

5. **Cite sources** - Reference which doc file(s) your answer comes from

## Cross-Domain Questions

If a question touches both Claude platform/API and Claude Code CLI topics, also invoke `claude-code-docs-search` to search `docs/claude-code/` for the CLI-related parts.

Examples requiring both skills:
- "How do I configure Claude Code to use a specific model?" (CLI config + model info)
- "How does Claude Code's tool use differ from the API?" (CLI + API comparison)
- "What's the difference between Agent SDK and Claude Code subagents?" (SDK + CLI)

## Example Queries

- "How do I use tool use with the Claude API?"
- "What models are available and their context windows?"
- "How do I implement streaming responses?"
- "How does prompt caching work?"
- "What's the Agent SDK?"
- "What are the API rate limits?"
