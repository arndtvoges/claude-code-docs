# Claude Code Documentation Reference

This directory contains the complete Claude Code documentation for answering implementation questions. They are located in `docs`.
It also contains the official Claude Code minified and obfuscated monolithic JS bundle. That is located in `claude-code-source-reference`.

## Purpose

We are building an orchestration layer over Claude Code that allows companies to import product and technical specs and implement them end-to-end in complex codebases. This layer heavily utilizes:

- **Subagents** - Parallel task execution
- **Workflows** - Multi-step orchestration
- **Skills** - Reusable capabilities
- **Tools** - MCP servers and custom integrations

This documentation directory exists to ask implementation questions and ground answers in the latest official documentation.

## Usage

When answering questions about Claude Code features or implementation details, **always use the `claude-code-docs-search` skill** to search the `docs/` folder first. This ensures answers are grounded in the actual documentation.

Not all features of Claude Code are documented in the docs. That's why you also have access to the `claude-code-reverse-engineer` skill. It allows you to read the closed-source, minified JS bundle of Claude Code that is downloaded locally.

## Documenting your work
Save each finding/answer you provide to the user under the `findings` directory as a markdown report.

## Keeping Docs Updated

Run the sync script to download the latest documentation:

```bash
./sync-docs.js
```

This will show you what files were added, updated, or removed.

## Out of scope
This directory does not contain the actual Claude Code orchestration tool itself. It merely exists to ask implementation/feasability/best practices questions.