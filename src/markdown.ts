import { marked } from 'marked';

/**
 * Convert markdown content to HTML using the marked library
 * @param content - The markdown content to convert
 * @returns The rendered HTML string
 */
export function renderMarkdown(content: string): string {
  return marked(content);
}

/**
 * Configure marked options if needed
 * This can be called during app initialization to customize markdown rendering
 */
export function configureMarkdown(options?: marked.MarkedOptions): void {
  if (options) {
    marked.setOptions(options);
  }
}
