import fs from 'node:fs';
import path from 'node:path';

const TRILIUM_URL = process.env.TRILIUM_URL || 'http://127.0.0.1:8080';
const ETAPI_TOKEN = process.env.TRILIUM_ETAPI_TOKEN;

async function syncNotes() {
  if (!ETAPI_TOKEN) {
    console.error('Error: TRILIUM_ETAPI_TOKEN environment variable is missing.');
    process.exit(1);
  }

  // Query Trilium for notes tagged #publish
  const searchUrl = `${TRILIUM_URL}/etapi/notes?search=${encodeURIComponent('#public')}`;
  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${ETAPI_TOKEN}` }
  });

  if (!res.ok) {
    throw new Error(`Trilium API failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  // ETAPI returns { results: [...] }
  const notes = data.results || (Array.isArray(data) ? data : []);

  console.log(`[${new Date().toISOString()}] Found ${notes.length} note(s) tagged #public.`);

  const outputDir = path.join(process.cwd(), 'content/notes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clear existing note markdown files
  for (const file of fs.readdirSync(outputDir)) {
    if (file.endsWith('.md')) fs.unlinkSync(path.join(outputDir, file));
  }

  for (const note of notes) {
    const contentRes = await fetch(`${TRILIUM_URL}/etapi/notes/${note.noteId}/content`, {
      headers: { Authorization: `Bearer ${ETAPI_TOKEN}` }
    });
    const content = await contentRes.text();

    const slug = note.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const date = note.utcDateCreated || new Date().toISOString();
    const updatedAt = note.utcDateModified || date;

    const attrs = note.attributes || [];
    const getLabel = (name) => attrs.find(a => a.type === 'label' && a.name === name)?.value || '';
    const description = getLabel('description');
    const tagsRaw = getLabel('tags');
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    let frontmatter = `---
title: "${note.title.replace(/"/g, '\\"')}"
date: "${date}"
updatedAt: "${updatedAt}"`;
    if (description) frontmatter += `\ndescription: "${description.replace(/"/g, '\\"')}"`;
    if (tags.length > 0) frontmatter += `\ntags: [${tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(', ')}]`;
    frontmatter += '\n---\n\n';

    fs.writeFileSync(path.join(outputDir, `${slug}.md`), frontmatter + content);
    console.log(`Synced: "${note.title}" -> ${slug}.md`);
  }
}

syncNotes().catch(err => {
  console.error(err);
  process.exit(1);
});
