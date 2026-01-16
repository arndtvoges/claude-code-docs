---
name: claude-code-docs-search
description: Search local Claude Code CLI documentation to answer questions about the Claude Code command-line tool. Use ONLY for Claude Code CLI topics: subagents, workflows, skills, hooks, MCP server configuration, plugins, settings, CLI options, headless mode, terminal integration, IDE extensions (VS Code, JetBrains), slash commands, or Claude Code-specific features. Do NOT use for Claude API, SDKs, models, or prompt engineering - use claude-docs-search instead.
allowed-tools: Read, Grep, Glob
---

# Claude Code CLI Documentation Search

Search `docs/claude-code/` for questions about the Claude Code command-line tool.

## Scope

**This skill covers**: Claude Code CLI features, installation, configuration, subagents, workflows, skills, hooks, MCP servers, plugins, settings, CLI commands, headless mode, IDE integrations, slash commands.

**NOT in scope** (use `claude-docs-search` instead): Claude API, Python/TypeScript SDKs, models, pricing, prompt engineering, tool use API, vision API, batch processing, or any platform-level capability.

## Instructions

1. **Start with the index** - Read `docs/claude-code/index.txt` to see available docs and topics

2. **Search for terms** - Use grep within `docs/claude-code/`:
   ```
   Grep pattern="subagent" path="docs/claude-code/"
   Grep pattern="hooks" path="docs/claude-code/"
   ```

3. **Read relevant files**:
   ```
   Read file_path="docs/claude-code/sub-agents.md"
   Read file_path="docs/claude-code/hooks.md"
   ```

4. **Follow links** - Map remote URLs to local files:
   - `https://code.claude.com/docs/...` --> `docs/claude-code/....md`
   - `https://platform.claude.com/docs/en/...` --> `docs/claude/...` (use `claude-docs-search`)

5. **Cite sources** - Reference which doc file(s) your answer comes from

## Cross-Domain Questions

If a question touches both Claude Code CLI and Claude platform/API topics, also invoke `claude-docs-search` to search `docs/claude/` for the platform-related parts.

Examples requiring both skills:
- "How do I configure Claude Code to use a specific model?" (CLI config + model info)
- "How does Claude Code's tool use differ from the API?" (CLI + API comparison)

## Example Queries

- "How do I create a subagent in Claude Code?"
- "What hooks are available?"
- "How do I configure MCP servers in Claude Code?"
- "What CLI settings can I customize?"
- "How do I run Claude Code in headless mode?"
