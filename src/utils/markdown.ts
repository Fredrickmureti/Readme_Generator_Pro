/**
 * Generates shields.io badge markdown
 * @param text - Badge text
 * @param color - Badge color
 * @param type - Badge type
 * @returns Markdown string for the badge
 */
export function generateBadge(text: string, color: string, type: string): string {
  return `![${text}](https://img.shields.io/badge/${text}-${color})`;
}

/**
 * Validates markdown content for common issues
 * @param content - Markdown content to validate
 * @returns Array of validation issues or empty array if valid
 */
export function validateMarkdown(content: string): string[] {
  const issues: string[] = [];
  
  // Check for broken links
  const linkPattern = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const links = content.matchAll(linkPattern);
  for (const link of links) {
    const url = link[2];
    if (!url.startsWith('http') && !url.startsWith('#') && !url.startsWith('./')) {
      issues.push(`Invalid link URL: ${url}`);
    }
  }

  // Check for unclosed code blocks
  const codeBlocks = (content.match(/```/g) || []).length;
  if (codeBlocks % 2 !== 0) {
    issues.push('Unclosed code block detected');
  }

  return issues;
}

/**
 * Formats markdown content with consistent spacing
 * @param content - Raw markdown content
 * @returns Formatted markdown content
 */
export function formatMarkdown(content: string): string {
  return content
    // Add empty line before headings
    .replace(/\n(#+\s)/g, '\n\n$1')
    // Add empty line before lists
    .replace(/\n(-|\d+\.)\s/g, '\n\n$1 ')
    // Remove multiple empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}