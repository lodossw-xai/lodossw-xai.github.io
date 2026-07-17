import { marked } from 'marked';

export interface ParsedMarkdown {
  id: string;
  title: string;
  date: string;
  author: string;
  category: 'notice' | 'qna';
  contentHtml: string;
  rawContent: string;
}

/**
 * Parses markdown file content with Frontmatter (YAML-like metadata at the top)
 */
export function parseMarkdown(fileName: string, fileContent: string): ParsedMarkdown {
  const frontmatterRegex = /^---([\s\S]*?)---/;
  const match = fileContent.match(frontmatterRegex);

  const metadata: Record<string, string> = {};
  let bodyContent = fileContent;

  if (match) {
    const matchedFull = match[0] as string;
    const rawYaml = match[1] as string;
    
    if (matchedFull && rawYaml) {
      bodyContent = fileContent.replace(matchedFull, '').trim();

      rawYaml.split('\n').forEach((line) => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const keyPart = parts[0];
          if (keyPart !== undefined) {
            const key = keyPart.trim();
            const value = parts.slice(1).join(':').trim().replace(/^['"]|['"]$/g, ''); // strip quotes
            metadata[key] = value;
          }
        }
      });
    }
  }

  // Parse markdown body to HTML string using marked
  const contentHtml = marked.parse(bodyContent) as string;

  // Extract ID from filename (e.g. "notice-1.md" -> "notice-1")
  const id = fileName.replace(/\.md$/, '').split('/').pop() || String(Math.random());
  
  const defaultDate = (new Date().toISOString().split('T')[0]) || '';

  return {
    id,
    title: metadata['title'] || 'No Title',
    date: metadata['date'] || defaultDate,
    author: metadata['author'] || 'Admin',
    category: (metadata['category'] === 'qna' ? 'qna' : 'notice') as 'notice' | 'qna',
    contentHtml,
    rawContent: bodyContent,
  };
}
