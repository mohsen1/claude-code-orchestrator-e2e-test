import { marked } from 'marked';

/**
 * Renders markdown content to HTML
 * @param markdown - The markdown string to convert
 * @returns HTML string
 */
export function render(markdown: string): string {
  return marked(markdown);
}
