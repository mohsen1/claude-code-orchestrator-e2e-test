import { marked } from 'marked';

/**
 * Converts markdown content to HTML
 * @param markdown - The markdown content to convert
 * @returns HTML string
 */
export function renderMarkdown(markdown: string): string {
  return marked(markdown);
}

/**
 * Configure marked options if needed
 */
marked.setOptions({
  breaks: false,
  gfm: true,
});
