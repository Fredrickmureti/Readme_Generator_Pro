import React, { useState, useEffect } from 'react';
import { FileDown, Github, Book, Link2, Code2, CheckCircle2, Package, Users, MessageSquare, Plus, Trash2, ArrowUpDown, Image, Shield, Coffee, Heart, Save, Download, Menu, X, Eye, EyeOff, Copy, FileText, Settings, Palette, BarChart } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Section, Badge, ProjectConfig, Theme } from './types';
import { generateBadge, validateMarkdown, formatMarkdown } from './utils/markdown';
import { analyzeReadme, AnalyzerResult } from './utils/analyzer';

const DEFAULT_CONFIG: ProjectConfig = {
  name: '',
  description: '',
  repoUrl: '',
  author: '',
  license: 'MIT',
  demoImage: '',
  badges: [
    { text: 'npm', color: 'blue', type: 'version' },
    { text: 'license', color: 'green', type: 'license' }
  ],
  sections: [
    { id: 'installation', title: 'Installation', content: '```bash\nnpm install\n```', isOptional: false },
    { id: 'usage', title: 'Usage', content: 'How to use the project', isOptional: false },
    { id: 'features', title: 'Features', content: '- Feature 1\n- Feature 2', isOptional: false },
    { id: 'api', title: 'API Documentation', content: '## Endpoints\n\n### GET /api/v1/resource\n\nReturns a list of resources.', isOptional: true },
    { id: 'contributing', title: 'Contributing', content: '1. Fork the project\n2. Create your feature branch\n3. Commit your changes\n4. Push to the branch\n5. Open a Pull Request', isOptional: true },
  ]
};

const THEMES: Theme[] = [
  { id: 'dark', name: 'Dark', bgGradient: 'from-gray-900 to-gray-800', accent: 'blue' },
  { id: 'midnight', name: 'Midnight', bgGradient: 'from-blue-900 to-gray-900', accent: 'indigo' },
  { id: 'forest', name: 'Forest', bgGradient: 'from-green-900 to-gray-900', accent: 'emerald' },
  { id: 'sunset', name: 'Sunset', bgGradient: 'from-orange-900 to-gray-900', accent: 'orange' },
];

function App() {
  const [config, setConfig] = useLocalStorage<ProjectConfig>('readme-config', DEFAULT_CONFIG);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [showPreviewInGFM, setShowPreviewInGFM] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzerResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const issues = validateMarkdown(generateReadme());
    setValidationIssues(issues);
  }, [config]);

  useEffect(() => {
    const result = analyzeReadme(generateReadme());
    setAnalysisResult(result);
  }, [config]);

  const generateBadges = () => {
    return config.badges.map(badge => {
      if (badge.type === 'version') {
        return `![npm](https://img.shields.io/npm/v/${config.name.toLowerCase()}?color=${badge.color})`;
      }
      if (badge.type === 'license') {
        return `![License](https://img.shields.io/badge/license-${config.license}-${badge.color})`;
      }
      return generateBadge(badge.text, badge.color, badge.type);
    }).join(' ');
  };

  const generateReadme = () => {
    const badges = generateBadges();
    const demo = config.demoImage ? `\n## Demo\n\n![Demo](${config.demoImage})\n` : '';
    const activeOptionalSections = config.sections.filter(section => !section.isOptional || section.content.trim() !== '');
    
    const readme = `# ${config.name}

${badges}

${config.description}
${demo}
${activeOptionalSections.map(section => `## ${section.title}\n\n${section.content}`).join('\n\n')}

## License

This project is licensed under the ${config.license} License - see the [LICENSE](LICENSE) file for details.

## Author

${config.author ? `Created with ❤️ by [${config.author}](${config.repoUrl})` : 'Created with ❤️'}

---
${generateFooter()}
`;
    return formatMarkdown(readme);
  };

  const generateFooter = () => {
    return `<p align="center">If you found this project useful, consider buying me a coffee!</p>
<p align="center">
  <a href="https://www.buymeacoffee.com/${config.author}">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee">
  </a>
</p>`;
  };

  const handleSectionChange = (id: string, content: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === id ? { ...section, content } : section
      )
    }));
  };

  const addNewSection = () => {
    const newId = `section-${config.sections.length + 1}`;
    setConfig(prev => ({
      ...prev,
      sections: [...prev.sections, {
        id: newId,
        title: 'New Section',
        content: '',
        isOptional: true
      }]
    }));
  };

  const removeSection = (id: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== id)
    }));
  };

  const handleDragStart = (id: string) => {
    setIsDragging(true);
    setDraggedSection(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedSection && draggedSection !== id) {
      const sections = [...config.sections];
      const draggedIndex = sections.findIndex(s => s.id === draggedSection);
      const dropIndex = sections.findIndex(s => s.id === id);
      const [draggedItem] = sections.splice(draggedIndex, 1);
      sections.splice(dropIndex, 0, draggedItem);
      setConfig(prev => ({ ...prev, sections }));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateReadme());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadReadme = () => {
    const blob = new Blob([generateReadme()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} text-white`}>
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold hidden md:inline">README Generator Pro</span>
            <span className="text-xl font-bold md:hidden">README Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors md:hidden"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className={`flex items-center gap-2 bg-${theme.accent}-500/20 hover:bg-${theme.accent}-500/30 text-${theme.accent}-300 px-4 py-2 rounded-md transition-colors`}
              >
                <BarChart className="w-4 h-4" />
                {showAnalysis ? 'Hide Analysis' : 'Analyze README'}
              </button>
              <button
                onClick={downloadReadme}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 bg-${theme.accent}-500 hover:bg-${theme.accent}-600 text-white px-4 py-2 rounded-md transition-colors`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto p-4 space-y-4">
            <button
              onClick={downloadReadme}
              className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Download README
            </button>
            <button
              onClick={copyToClipboard}
              className={`w-full flex items-center justify-center gap-2 bg-${theme.accent}-500 hover:bg-${theme.accent}-600 text-white px-4 py-2 rounded-md transition-colors`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="container mx-auto p-4 h-full flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t)}
                        className={`p-4 rounded-md border ${
                          theme.id === t.id
                            ? `border-${t.accent}-500 bg-${t.accent}-500/20`
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-full h-2 rounded bg-gradient-to-r ${t.bgGradient} mb-2`} />
                        <span className="text-sm">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Panel */}
      {showAnalysis && analysisResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-blue-400" />
                  README Analysis
                </h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="p-2 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Score */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Documentation Score</span>
                  <span className="text-2xl font-bold">{analysisResult.score}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full bg-${theme.accent}-500`}
                    style={{ width: `${analysisResult.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Overall Suggestions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Overall Assessment</h3>
                {analysisResult.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-gray-300 mb-2">{suggestion}</p>
                ))}
              </div>

              {/* Detailed Improvements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suggested Improvements</h3>
                {analysisResult.improvements.map((improvement, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{improvement.category}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {improvement.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-300">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className={`grid md:grid-cols-2 gap-8 ${showPreview ? 'md:grid-cols-1' : ''}`}>
          {/* Left Panel - Editor */}
          <div className={`space-y-6 ${showPreview ? 'hidden' : ''}`}>
            {/* Project Details */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Project Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white h-32"
                    placeholder="A brief description of your project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Repository URL</label>
                  <input
                    type="text"
                    value={config.repoUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, repoUrl: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <input
                    type="text"
                    value={config.author}
                    onChange={(e) => setConfig(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">License</label>
                  <select
                    value={config.license}
                    onChange={(e) => setConfig(prev => ({ ...prev, license: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white"
                  >
                    <option value="MIT">MIT</option>
                    <option value="Apache-2.0">Apache 2.0</option>
                    <option value="GPL-3.0">GPL 3.0</option>
                    <option value="BSD-3-Clause">BSD 3-Clause</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Demo Image URL</label>
                  <input
                    type="text"
                    value={config.demoImage}
                    onChange={(e) => setConfig(prev => ({ ...prev, demoImage: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white"
                    placeholder="https://example.com/demo.gif"
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            {config.sections.map((section, index) => (
              <div
                key={section.id}
                draggable
                onDragStart={() => handleDragStart(section.id)}
                onDragOver={(e) => handleDragOver(e, section.id)}
                onDragEnd={() => setIsDragging(false)}
                className={`bg-gray-800/50 rounded-lg p-6 border border-gray-700 ${
                  isDragging ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-blue-400" />
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...config.sections];
                        newSections[index].title = e.target.value;
                        setConfig(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="bg-transparent border-b border-gray-700 focus:border-blue-400 outline-none"
                    />
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (index > 0) {
                          const newSections = [...config.sections];
                          [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
                          setConfig(prev => ({ ...prev, sections: newSections }));
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      disabled={index === 0}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                    {section.isOptional && (
                      <button
                        onClick={() => removeSection(section.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => handleSectionChange(section.id, e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white h-32"
                  placeholder={`Enter ${section.title} content`}
                />
              </div>
            ))}

            {/* Add Section Button */}
            <button
              onClick={addNewSection}
              className="w-full bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 rounded-lg p-4 text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Section
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className={`space-y-6 ${!showPreview && 'hidden md:block'}`}>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Preview
                </h2>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showPreviewInGFM}
                      onChange={(e) => setShowPreviewInGFM(e.target.checked)}
                      className="rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500"
                    />
                    Show as GitHub Flavored Markdown
                  </label>
                </div>
              </div>
              
              {/* Validation Issues */}
              {validationIssues.length > 0 && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-md">
                  <h3 className="text-red-400 font-semibold mb-2">Validation Issues:</h3>
                  <ul className="list-disc list-inside text-sm text-red-300">
                    {validationIssues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Content */}
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-auto max-h-[calc(100vh-200px)]">
                <pre className="whitespace-pre-wrap">{generateReadme()}</pre>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Made for developers, by developer <a className="text-yellow-900" href="https://www.devfredrick.me">DevFredrick</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;