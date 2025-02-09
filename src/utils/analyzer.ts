/**
 * Analyzes README content and provides improvement suggestions
 */
export interface AnalyzerResult {
  score: number;
  suggestions: string[];
  improvements: {
    category: string;
    items: string[];
  }[];
}

export function analyzeReadme(content: string): AnalyzerResult {
  const result: AnalyzerResult = {
    score: 0,
    suggestions: [],
    improvements: []
  };

  // Initialize score
  let score = 0;

  // Check for essential sections
  const sections = {
    installation: /##\s+installation/i.test(content),
    usage: /##\s+usage/i.test(content),
    features: /##\s+features/i.test(content),
    contributing: /##\s+contributing/i.test(content),
    license: /##\s+license/i.test(content)
  };

  // Essential sections check
  const missingSections = [];
  Object.entries(sections).forEach(([section, exists]) => {
    if (!exists) {
      missingSections.push(section);
    } else {
      score += 10;
    }
  });

  if (missingSections.length > 0) {
    result.improvements.push({
      category: 'Missing Sections',
      items: missingSections.map(section => 
        `Add a ${section.charAt(0).toUpperCase() + section.slice(1)} section to improve documentation completeness`
      )
    });
  }

  // Check code examples
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
  if (codeBlocks === 0) {
    result.improvements.push({
      category: 'Code Examples',
      items: ['Add code examples to demonstrate usage']
    });
  } else {
    score += 15;
  }

  // Check images and badges
  const hasImages = /!\[.*?\]\(.*?\)/.test(content);
  const hasBadges = /https:\/\/img\.shields\.io/.test(content);
  
  if (!hasImages) {
    result.improvements.push({
      category: 'Visual Content',
      items: ['Add screenshots or diagrams to better illustrate your project']
    });
  } else {
    score += 10;
  }

  if (!hasBadges) {
    result.improvements.push({
      category: 'Project Status',
      items: ['Add status badges to show project health and metrics']
    });
  } else {
    score += 5;
  }

  // Check content length and structure
  const lines = content.split('\n').length;
  if (lines < 50) {
    result.improvements.push({
      category: 'Content Length',
      items: ['Expand documentation with more detailed explanations']
    });
  } else {
    score += 10;
  }

  // Check for API documentation
  const hasApiDocs = /##.*api|endpoint|route/i.test(content);
  if (!hasApiDocs && content.includes('api')) {
    result.improvements.push({
      category: 'API Documentation',
      items: ['Add detailed API documentation with endpoints and examples']
    });
  } else if (hasApiDocs) {
    score += 10;
  }

  // Check for contribution guidelines
  const hasDetailedContribution = content.includes('fork') && content.includes('pull request');
  if (!hasDetailedContribution && sections.contributing) {
    result.improvements.push({
      category: 'Contributing Guidelines',
      items: ['Expand contribution guidelines with step-by-step instructions']
    });
  } else if (hasDetailedContribution) {
    score += 10;
  }

  // Generate overall suggestions
  if (score < 30) {
    result.suggestions.push('Your README needs significant improvement. Focus on adding essential sections and more detailed content.');
  } else if (score < 60) {
    result.suggestions.push('Your README is on the right track but could benefit from more comprehensive documentation.');
  } else if (score < 80) {
    result.suggestions.push('Good README! Consider implementing the suggested improvements to make it even better.');
  } else {
    result.suggestions.push('Excellent README! Keep maintaining this high quality of documentation.');
  }

  result.score = Math.min(100, score);
  return result;
}