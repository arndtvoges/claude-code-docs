#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { execSync } = require('child_process');

// Claude Code docs (flat structure)
const CLAUDE_CODE_INDEX_URL = 'https://code.claude.com/docs/llms.txt';
const CLAUDE_CODE_DOCS_DIR = path.join(__dirname, 'docs', 'claude-code');

// Claude platform docs (hierarchical structure)
const CLAUDE_SITEMAP_URL = 'https://platform.claude.com/sitemap.xml';
const CLAUDE_DOCS_DIR = path.join(__dirname, 'docs', 'claude');

// Source reference
const SOURCE_DIR = path.join(__dirname, 'claude-code-source-reference');
const NPM_REGISTRY_URL = 'https://registry.npmjs.org/@anthropic-ai/claude-code';

// Legacy docs dir (for migration)
const LEGACY_DOCS_DIR = path.join(__dirname, 'docs');

async function main() {
  // Migrate existing docs to claude-code subfolder if needed
  await migrateExistingDocs();

  // Sync Claude Code docs
  await syncClaudeCodeDocs();

  // Sync Claude platform docs
  await syncClaudeDocs();

  // Sync Claude Code source
  await syncClaudeCodeSource();
}

/**
 * Migrate existing flat docs/ structure to docs/claude-code/
 */
async function migrateExistingDocs() {
  // Check if there are .md files directly in docs/ (old structure)
  if (!fs.existsSync(LEGACY_DOCS_DIR)) {
    return;
  }

  const legacyFiles = fs.readdirSync(LEGACY_DOCS_DIR).filter(f =>
    f.endsWith('.md') || f === 'index.txt'
  );

  if (legacyFiles.length === 0) {
    return;
  }

  // Check if claude-code subfolder already exists with content
  if (fs.existsSync(CLAUDE_CODE_DOCS_DIR)) {
    const existingClaudeCodeFiles = fs.readdirSync(CLAUDE_CODE_DOCS_DIR);
    if (existingClaudeCodeFiles.length > 0) {
      // Already migrated
      return;
    }
  }

  console.log('='.repeat(40));
  console.log('Migrating existing docs to claude-code/');
  console.log('='.repeat(40) + '\n');

  // Create claude-code directory
  fs.mkdirSync(CLAUDE_CODE_DOCS_DIR, { recursive: true });

  // Move files
  for (const file of legacyFiles) {
    const src = path.join(LEGACY_DOCS_DIR, file);
    const dest = path.join(CLAUDE_CODE_DOCS_DIR, file);
    fs.renameSync(src, dest);
    console.log(`  Moved: ${file}`);
  }

  console.log(`\nMigrated ${legacyFiles.length} files to docs/claude-code/\n`);
}

/**
 * Sync Claude Code documentation from code.claude.com
 */
async function syncClaudeCodeDocs() {
  console.log('='.repeat(40));
  console.log('Syncing Claude Code Docs');
  console.log('='.repeat(40) + '\n');

  // Track changes
  const newFiles = [];
  const updatedFiles = [];
  const deletedFiles = [];

  // Ensure docs directory exists
  if (!fs.existsSync(CLAUDE_CODE_DOCS_DIR)) {
    fs.mkdirSync(CLAUDE_CODE_DOCS_DIR, { recursive: true });
  }

  // Get existing .md files before sync
  const existingFiles = new Set(
    fs.readdirSync(CLAUDE_CODE_DOCS_DIR).filter(f => f.endsWith('.md'))
  );

  // Download index file
  console.log('Downloading index...');
  const indexResponse = await fetch(CLAUDE_CODE_INDEX_URL);
  if (!indexResponse.ok) {
    throw new Error(`Failed to fetch index: ${indexResponse.status}`);
  }
  const indexContent = await indexResponse.text();
  fs.writeFileSync(path.join(CLAUDE_CODE_DOCS_DIR, 'index.txt'), indexContent);

  // Parse URLs from index (markdown link format)
  const urlRegex = /\[.*?\]\((https:\/\/[^)]+\.md)\)/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(indexContent)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} documentation files to sync...\n`);

  // Track which files we process from sitemap
  const sitemapFiles = new Set();

  // Download each markdown file
  for (const url of urls) {
    const filename = path.basename(url);
    sitemapFiles.add(filename);
    const filepath = path.join(CLAUDE_CODE_DOCS_DIR, filename);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  Failed to fetch ${filename}: ${response.status}`);
        continue;
      }
      const content = await response.text();

      if (!existingFiles.has(filename)) {
        // New file
        fs.writeFileSync(filepath, content);
        newFiles.push(filename);
        console.log(`  + ${filename}`);
      } else {
        // Check if content changed
        const existingContent = fs.readFileSync(filepath, 'utf-8');
        if (existingContent !== content) {
          fs.writeFileSync(filepath, content);
          updatedFiles.push(filename);
          console.log(`  ~ ${filename}`);
        }
      }
    } catch (err) {
      console.error(`  Error processing ${filename}: ${err.message}`);
    }
  }

  // Delete files no longer in sitemap
  for (const file of existingFiles) {
    if (!sitemapFiles.has(file)) {
      fs.unlinkSync(path.join(CLAUDE_CODE_DOCS_DIR, file));
      deletedFiles.push(file);
      console.log(`  - ${file}`);
    }
  }

  // Print summary
  printSyncSummary('Claude Code Docs', newFiles, updatedFiles, deletedFiles);
}

/**
 * Sync Claude platform documentation from platform.claude.com
 */
async function syncClaudeDocs() {
  console.log('='.repeat(40));
  console.log('Syncing Claude Platform Docs');
  console.log('='.repeat(40) + '\n');

  // Track changes
  const newFiles = [];
  const updatedFiles = [];
  const deletedFiles = [];

  // Ensure docs directory exists
  if (!fs.existsSync(CLAUDE_DOCS_DIR)) {
    fs.mkdirSync(CLAUDE_DOCS_DIR, { recursive: true });
  }

  // Get existing files before sync (recursively)
  const existingFiles = new Set(getFilesRecursively(CLAUDE_DOCS_DIR));

  // Fetch sitemap
  console.log('Fetching sitemap...');
  const sitemapRes = await fetch(CLAUDE_SITEMAP_URL);
  if (!sitemapRes.ok) {
    throw new Error(`Failed to fetch sitemap: ${sitemapRes.status}`);
  }
  const sitemapXml = await sitemapRes.text();

  // Parse URLs - extract only /docs/en/ URLs
  const urlRegex = /<loc>(https:\/\/platform\.claude\.com\/docs\/en\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  while ((match = urlRegex.exec(sitemapXml)) !== null) {
    urls.push(match[1]);
  }

  console.log(`Found ${urls.length} documentation pages to sync...\n`);

  // Track which files we process from sitemap
  const sitemapFiles = new Set();

  // Download each markdown file
  for (const url of urls) {
    // Extract relative path from URL
    // e.g., "https://platform.claude.com/docs/en/about-claude/models" -> "about-claude/models"
    const relativePath = url.replace('https://platform.claude.com/docs/en/', '');

    // Skip empty paths
    if (!relativePath) continue;

    // Determine file path: docs/claude/about-claude/models.md
    const filePath = path.join(CLAUDE_DOCS_DIR, relativePath + '.md');
    const relativeFilePath = path.relative(CLAUDE_DOCS_DIR, filePath);
    sitemapFiles.add(relativeFilePath);

    try {
      // Fetch markdown version (URL + .md)
      const mdUrl = url + '.md';
      const response = await fetch(mdUrl);
      if (!response.ok) {
        console.error(`  Failed to fetch ${relativePath}: ${response.status}`);
        continue;
      }
      const content = await response.text();

      // Ensure directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      if (!existingFiles.has(relativeFilePath)) {
        // New file
        fs.writeFileSync(filePath, content);
        newFiles.push(relativeFilePath);
        console.log(`  + ${relativeFilePath}`);
      } else {
        // Check if content changed
        const existingContent = fs.readFileSync(filePath, 'utf-8');
        if (existingContent !== content) {
          fs.writeFileSync(filePath, content);
          updatedFiles.push(relativeFilePath);
          console.log(`  ~ ${relativeFilePath}`);
        }
      }
    } catch (err) {
      console.error(`  Error processing ${relativePath}: ${err.message}`);
    }
  }

  // Delete files no longer in sitemap
  for (const file of existingFiles) {
    if (!sitemapFiles.has(file)) {
      const filePath = path.join(CLAUDE_DOCS_DIR, file);
      fs.unlinkSync(filePath);
      deletedFiles.push(file);
      console.log(`  - ${file}`);

      // Clean up empty directories
      cleanEmptyDirs(path.dirname(filePath));
    }
  }

  // Print summary
  printSyncSummary('Claude Platform Docs', newFiles, updatedFiles, deletedFiles);
}

/**
 * Get all .md files recursively from a directory
 */
function getFilesRecursively(dir, baseDir = dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath, baseDir));
    } else if (entry.name.endsWith('.md')) {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  return files;
}

/**
 * Remove empty directories recursively up to CLAUDE_DOCS_DIR
 */
function cleanEmptyDirs(dir) {
  if (dir === CLAUDE_DOCS_DIR || !dir.startsWith(CLAUDE_DOCS_DIR)) {
    return;
  }

  try {
    const entries = fs.readdirSync(dir);
    if (entries.length === 0) {
      fs.rmdirSync(dir);
      cleanEmptyDirs(path.dirname(dir));
    }
  } catch (err) {
    // Directory doesn't exist or can't be read, that's fine
  }
}

/**
 * Print sync summary for a doc type
 */
function printSyncSummary(docType, newFiles, updatedFiles, deletedFiles) {
  console.log('\n' + '-'.repeat(40));
  console.log(`${docType} Sync Complete`);
  console.log('-'.repeat(40) + '\n');

  console.log(`New files (${newFiles.length}):`);
  if (newFiles.length > 0) {
    newFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    if (newFiles.length > 10) {
      console.log(`  ... and ${newFiles.length - 10} more`);
    }
  } else {
    console.log('  (none)');
  }

  console.log(`\nUpdated files (${updatedFiles.length}):`);
  if (updatedFiles.length > 0) {
    updatedFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    if (updatedFiles.length > 10) {
      console.log(`  ... and ${updatedFiles.length - 10} more`);
    }
  } else {
    console.log('  (none)');
  }

  console.log(`\nDeleted files (${deletedFiles.length}):`);
  if (deletedFiles.length > 0) {
    deletedFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    if (deletedFiles.length > 10) {
      console.log(`  ... and ${deletedFiles.length - 10} more`);
    }
  } else {
    console.log('  (none)');
  }

  console.log('');
}

async function syncClaudeCodeSource() {
  console.log('\n' + '='.repeat(40));
  console.log('Syncing Claude Code Source');
  console.log('='.repeat(40) + '\n');

  // Get latest version from NPM registry
  const registryRes = await fetch(NPM_REGISTRY_URL);
  if (!registryRes.ok) {
    throw new Error(`Failed to fetch NPM registry: ${registryRes.status}`);
  }
  const registryData = await registryRes.json();
  const latestVersion = registryData['dist-tags'].latest;
  const tarballUrl = registryData.versions[latestVersion].dist.tarball;

  console.log(`Latest version: ${latestVersion}`);
  console.log(`Downloading from: ${tarballUrl}`);

  // Clear and recreate directory
  if (fs.existsSync(SOURCE_DIR)) {
    fs.rmSync(SOURCE_DIR, { recursive: true });
  }
  fs.mkdirSync(SOURCE_DIR, { recursive: true });

  // Download tarball
  const tarballRes = await fetch(tarballUrl);
  if (!tarballRes.ok) {
    throw new Error(`Failed to download tarball: ${tarballRes.status}`);
  }
  const tarballBuffer = Buffer.from(await tarballRes.arrayBuffer());
  const tarballPath = path.join(SOURCE_DIR, 'package.tgz');
  fs.writeFileSync(tarballPath, tarballBuffer);

  // Extract using tar
  execSync(`tar -xzf package.tgz`, { cwd: SOURCE_DIR });

  // Move files from package/ to SOURCE_DIR, excluding vendor/
  const packageDir = path.join(SOURCE_DIR, 'package');
  const files = fs.readdirSync(packageDir);
  for (const file of files) {
    if (file === 'vendor') continue; // Skip ripgrep binaries
    const src = path.join(packageDir, file);
    const dest = path.join(SOURCE_DIR, file);
    fs.renameSync(src, dest);
  }

  // Cleanup
  fs.rmSync(packageDir, { recursive: true });
  fs.unlinkSync(tarballPath);

  console.log(`\nExtracted to ${SOURCE_DIR}:`);
  fs.readdirSync(SOURCE_DIR).forEach(f => console.log(`  - ${f}`));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
