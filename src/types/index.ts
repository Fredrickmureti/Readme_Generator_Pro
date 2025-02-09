/**
 * Represents a section in the README document
 */
export interface Section {
  /** Unique identifier for the section */
  id: string;
  /** Section title displayed in the UI */
  title: string;
  /** Markdown content of the section */
  content: string;
  /** Whether the section can be removed */
  isOptional?: boolean;
  /** Section template for new sections */
  template?: string;
}

/**
 * Represents a badge in the README document
 */
export interface Badge {
  /** Badge text displayed on shields.io */
  text: string;
  /** Badge color (hex or named color) */
  color: string;
  /** Badge type (version, license, custom) */
  type: string;
}

/**
 * Theme configuration interface
 */
export interface Theme {
  /** Theme identifier */
  id: string;
  /** Theme display name */
  name: string;
  /** Background gradient classes */
  bgGradient: string;
  /** Accent color */
  accent: string;
}

/**
 * Project configuration interface
 */
export interface ProjectConfig {
  /** Project name */
  name: string;
  /** Project description */
  description: string;
  /** GitHub repository URL */
  repoUrl: string;
  /** Project author */
  author: string;
  /** Project license */
  license: string;
  /** Demo image URL */
  demoImage: string;
  /** List of project badges */
  badges: Badge[];
  /** List of README sections */
  sections: Section[];
}