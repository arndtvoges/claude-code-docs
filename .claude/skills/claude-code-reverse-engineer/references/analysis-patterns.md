# Analysis Patterns for Minified Code

Reference guide for analyzing the Claude Code CLI bundle (`cli.js`).

## Bundle Characteristics

- **Bundler**: esbuild
- **Size**: ~11MB minified
- **Format**: Single-file IIFE with lazy-loaded modules
- **Obfuscation**: Variable shortening only (no string encryption)

## Key Patterns

### Module Boundaries

Modules are wrapped in lazy-load functions:

```javascript
w(()=>{
  // Module code here
})
```

The `w()` function (or similar single-letter name) defers execution until first use.

### Variable Naming Convention

| Original | Minified |
|----------|----------|
| `function` | `a`, `b`, `c` |
| `const` | `a2`, `b2`, `c2` |
| `class` | `A`, `B`, `C` |
| `imports` | Single letters with numeric suffix |

### String Literals

Strings are preserved intact, making them the best search anchors:

```javascript
// Error messages preserved
"Command timed out after"
"Permission denied"
"Invalid tool input"

// Tool names preserved
"Bash"
"FileRead"
"FileWrite"

// UI text preserved
"Thinking..."
"Working on it..."
```

### Object Property Access

Properties are usually preserved as strings:

```javascript
// Becomes
a.timeout    // property access preserved
a["timeout"] // string access preserved
```

## Effective Search Strategies

### 1. Error Message Mining

Error messages reveal control flow and validation:

```bash
# Find all error throws
Grep pattern="throw new Error" path="cli.js"

# Find specific error conditions
Grep pattern="must be a" path="cli.js"
Grep pattern="is required" path="cli.js"
Grep pattern="invalid" path="cli.js" -i
```

### 2. Tool Discovery

Find tool implementations by their string names:

```bash
# Find tool registration
Grep pattern='name:"Bash"' path="cli.js"
Grep pattern='name:"FileRead"' path="cli.js"

# Find tool schema definitions
Grep pattern='"type":"string"' path="cli.js"
```

### 3. Feature Flags

Find configuration and feature toggles:

```bash
# Environment variables
Grep pattern="process.env" path="cli.js"
Grep pattern="CLAUDE_" path="cli.js"

# Feature checks
Grep pattern="enabled" path="cli.js"
Grep pattern="disabled" path="cli.js"
```

### 4. API Endpoints

Find network calls:

```bash
# API URLs
Grep pattern="api.anthropic.com" path="cli.js"
Grep pattern="/v1/" path="cli.js"

# Fetch/HTTP patterns
Grep pattern="fetch(" path="cli.js"
Grep pattern="headers:" path="cli.js"
```

### 5. React Components

Find UI component logic:

```bash
# JSX markers
Grep pattern="createElement" path="cli.js"
Grep pattern="useState" path="cli.js"

# Component text
Grep pattern="Loading" path="cli.js"
Grep pattern="Error:" path="cli.js"
```

## Interpreting Results

### Context Lines

Always use context when searching:

```bash
# Get 3 lines before and after
Grep pattern="timeout" path="cli.js" -C=3

# Get 5 lines after (for function bodies)
Grep pattern="function.*timeout" path="cli.js" -A=5
```

### Following References

When you find something interesting:

1. Note the surrounding variable names
2. Search for those variables nearby
3. Look for related string literals
4. Check `sdk-tools.d.ts` for documented behavior

### Common Structures

**Validation block:**
```javascript
if(!a.timeout)throw new Error("timeout is required")
```

**Switch on tool type:**
```javascript
switch(a.name){case"Bash":...case"FileRead":...}
```

**Async operation:**
```javascript
async function a(){return await b()}
```

## Limitations to Remember

1. **No semantic variable names** - You cannot search for `timeout` and find a variable called `timeout`
2. **Split strings** - Some strings may be concatenated: `"time"+"out"`
3. **Dynamic property access** - `obj[varName]` hides the property name
4. **Inlined code** - Small functions may be inlined, losing boundaries

## Tips for Success

1. **Start with strings** - Always search for literal text first
2. **Use sdk-tools.d.ts** - It has full documentation for the public API
3. **Broaden then narrow** - Start with partial matches, refine as needed
4. **Multiple searches** - Combine results from different angles
5. **Document findings** - Note the byte position for future reference
