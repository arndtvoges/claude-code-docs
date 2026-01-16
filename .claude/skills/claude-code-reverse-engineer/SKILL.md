---
name: claude-code-reverse-engineer
description: Analyze the closed-source Claude Code CLI bundle to answer implementation questions not covered in documentation. Use when users ask about internal behavior, undocumented features, how specific tools work internally, or implementation details that aren't in the docs.
allowed-tools: Read, Grep, Glob
---

# Claude Code Reverse Engineering

Analyze the minified Claude Code CLI bundle to answer questions about internal implementation details not covered in the official documentation.

## Source Files

All source files are in `claude-code-source-reference/`:

| File | Description |
|------|-------------|
| `sdk-tools.d.ts` | TypeScript definitions - the "Rosetta Stone" with full API documentation |
| `cli.js` | 11MB minified bundle - the actual implementation |
| `package.json` | Version metadata and dependencies |

## Analysis Workflow

### Step 1: Start with TypeScript Definitions

For most API-related questions, `sdk-tools.d.ts` contains complete documentation:

```
Read file_path="claude-code-source-reference/sdk-tools.d.ts"
```

This file includes:
- All 30+ tool type definitions with JSDoc comments
- Input schemas and validation rules
- Parameter descriptions and constraints
- Enum values for options

### Step 2: Search the Bundle for Implementation Details

When you need deeper implementation details, search `cli.js`:

```
Grep pattern="your search term" path="claude-code-source-reference/cli.js" output_mode="content" -C=3
```

Effective search targets:
- **Error messages** - Find error handling logic
- **Tool names** - Find tool implementations (e.g., "Bash", "FileRead")
- **UI strings** - Find React component logic
- **Feature names** - Find specific features (e.g., "sandbox", "background")
- **API endpoints** - Find network calls

### Step 3: Cross-Reference Findings

Combine information from both sources:
1. Get the API contract from `sdk-tools.d.ts`
2. Find implementation details in `cli.js`
3. Correlate variable names with documented behavior

## Common Search Patterns

### Finding Tool Implementations

Search for tool name strings to locate implementation:
```
Grep pattern='"Bash"' path="claude-code-source-reference/cli.js"
Grep pattern='"FileRead"' path="claude-code-source-reference/cli.js"
```

### Finding Error Handling

Search for error message text:
```
Grep pattern="error.*timeout" path="claude-code-source-reference/cli.js" -i
Grep pattern="permission denied" path="claude-code-source-reference/cli.js" -i
```

### Finding Feature Flags

Search for feature-related strings:
```
Grep pattern="sandbox" path="claude-code-source-reference/cli.js"
Grep pattern="background" path="claude-code-source-reference/cli.js"
```

### Finding UI Components

Search for visible UI text:
```
Grep pattern="Thinking" path="claude-code-source-reference/cli.js"
Grep pattern="Working" path="claude-code-source-reference/cli.js"
```

## Bundle Structure

The bundle uses esbuild with these patterns:

- **Lazy-load wrapper**: `w(()=>{` marks module boundaries
- **Variable naming**: Single letters with numeric suffixes (e.g., `a2`, `b3`)
- **String literals**: Preserved, making them excellent search anchors

See `references/analysis-patterns.md` for detailed patterns.

## Limitations

- Variable names are obfuscated (single letters, numeric suffixes)
- Control flow is difficult to trace through minified code
- Some string literals may be split or concatenated
- Cannot trace complex async logic

## Best Use Cases

1. **Finding features** - Does Claude Code support X?
2. **Understanding API contracts** - What parameters does tool Y accept?
3. **Locating specific strings** - Where does error message Z come from?
4. **Verifying behavior** - How does feature W actually work?

## Example Queries

### "How does the Bash tool implement timeouts?"

1. Read `sdk-tools.d.ts` to find `BashInput.timeout` definition
2. Search `cli.js` for timeout-related error messages
3. Correlate the implementation logic

### "What subagent types are available?"

1. Search `sdk-tools.d.ts` for `AgentInput.subagent_type`
2. Search `cli.js` for subagent type strings
3. List all discovered types

### "How does sandbox mode work?"

1. Search `cli.js` for "sandbox" strings
2. Find related configuration and flags
3. Trace the sandboxing logic

## Citing Findings

Always cite the specific file and location:
- "Found in `sdk-tools.d.ts` at line 42: BashInput.timeout accepts milliseconds"
- "Found in `cli.js` near position 1234567: error message 'Command timed out'"
