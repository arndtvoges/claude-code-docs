#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const INDEX_URL = 'https://code.claude.com/docs/llms.txt';
const DOCS_DIR = path.join(__dirname, 'docs');

async function main() {
  // Track changes
  const newFiles = [];
  const updatedFiles = [];
  const deletedFiles = [];

  // Ensure docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  // Get existing .md files before sync
  const existingFiles = new Set(
    fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'))
  );

  // Download index file
  console.log('Downloading index...');
  const indexResponse = await fetch(INDEX_URL);
  if (!indexResponse.ok) {
    throw new Error(`Failed to fetch index: ${indexResponse.status}`);
  }
  const indexContent = await indexResponse.text();
  fs.writeFileSync(path.join(DOCS_DIR, 'index.txt'), indexContent);

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
    const filepath = path.join(DOCS_DIR, filename);

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
      fs.unlinkSync(path.join(DOCS_DIR, file));
      deletedFiles.push(file);
      console.log(`  - ${file}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(40));
  console.log('Documentation Sync Complete');
  console.log('='.repeat(40) + '\n');

  console.log(`New files (${newFiles.length}):`);
  if (newFiles.length > 0) {
    newFiles.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('  (none)');
  }

  console.log(`\nUpdated files (${updatedFiles.length}):`);
  if (updatedFiles.length > 0) {
    updatedFiles.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('  (none)');
  }

  console.log(`\nDeleted files (${deletedFiles.length}):`);
  if (deletedFiles.length > 0) {
    deletedFiles.forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('  (none)');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
