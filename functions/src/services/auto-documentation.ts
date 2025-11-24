import OpenAI from 'openai';
import { simpleGit, SimpleGit } from 'simple-git';
import * as fs from 'fs/promises';
import * as path from 'path';

// Types
export interface CodeChange {
    type: 'ui' | 'api' | 'feature' | 'bugfix' | 'refactor';
    files: string[];
    diff: string;
    commitMessage: string;
    commitHash: string;
    author: string;
    timestamp: Date;
    jiraTicket?: string;
}

export interface Documentation {
    userDocumentation: {
        title: string;
        overview: string;
        steps: string[];
        screenshots: string[];
        tips: string[];
        troubleshooting: string[];
    };
    technicalDocumentation: {
        apiChanges: string;
        breaking: boolean;
        migration: string;
        codeExamples: string[];
    };
    trainingMaterial: {
        videoScript: string;
        duration: string;
        keyPoints: string[];
        quizQuestions: Array<{
            question: string;
            options: string[];
            correct: number;
            explanation: string;
        }>;
    };
    releaseNotes: {
        version: string;
        highlights: string[];
        improvements: string[];
        bugFixes: string[];
    };
}

export class AutoDocumentationService {
    private openai: OpenAI;
    private git: SimpleGit;
    private repoPath: string;

    constructor(apiKey: string, repoPath: string) {
        this.openai = new OpenAI({ apiKey });
        this.git = simpleGit(repoPath);
        this.repoPath = repoPath;
    }

    /**
     * Detect changes from latest commit
     */
    async detectChanges(commitHash?: string): Promise<CodeChange> {
        // Get latest commit if not specified
        if (!commitHash) {
            const log = await this.git.log({ maxCount: 1 });
            commitHash = log.latest?.hash;
        }

        if (!commitHash) {
            throw new Error('No commits found');
        }

        // Get commit details
        const commit = await this.git.show([commitHash]);
        const diff = await this.git.diff([`${commitHash}~1`, commitHash]);

        // Parse commit message
        const lines = commit.split('\n');
        const commitMessage = lines.find(l => l.startsWith('    '))?.trim() || '';
        const author = lines.find(l => l.startsWith('Author:'))?.replace('Author:', '').trim() || '';

        // Extract JIRA ticket
        const jiraMatch = commitMessage.match(/([A-Z]+-\d+)/);
        const jiraTicket = jiraMatch ? jiraMatch[1] : undefined;

        // Get changed files
        const diffSummary = await this.git.diffSummary([`${commitHash}~1`, commitHash]);
        const files = diffSummary.files.map(f => f.file);

        // Determine change type
        const type = this.determineChangeType(files, commitMessage, diff);

        return {
            type,
            files,
            diff,
            commitMessage,
            commitHash,
            author,
            timestamp: new Date(),
            jiraTicket
        };
    }

    /**
     * Determine type of change
     */
    private determineChangeType(files: string[], message: string, diff: string): CodeChange['type'] {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('fix') || lowerMessage.includes('bug')) {
            return 'bugfix';
        }
        if (lowerMessage.includes('refactor')) {
            return 'refactor';
        }
        if (files.some(f => f.includes('/api/') || f.includes('functions/'))) {
            return 'api';
        }
        if (files.some(f => f.includes('.tsx') || f.includes('.jsx') || f.includes('components/'))) {
            return 'ui';
        }
        return 'feature';
    }

    /**
     * Generate comprehensive documentation
     */
    async generateDocumentation(change: CodeChange): Promise<Documentation> {
        const prompt = this.buildDocumentationPrompt(change);

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert technical writer who creates comprehensive, user-friendly documentation. Generate clear, actionable documentation that helps both technical and non-technical users.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5,
            max_tokens: 4000
        });

        const documentation = JSON.parse(response.choices[0].message.content || '{}');
        return this.validateAndEnhanceDocumentation(documentation, change);
    }

    /**
     * Build documentation generation prompt
     */
    private buildDocumentationPrompt(change: CodeChange): string {
        return `Generate comprehensive documentation for this code change:

**Change Type:** ${change.type}
**Commit Message:** ${change.commitMessage}
**Files Modified:** ${change.files.join(', ')}
**JIRA Ticket:** ${change.jiraTicket || 'N/A'}

**Code Diff:**
\`\`\`
${change.diff.substring(0, 3000)} ${change.diff.length > 3000 ? '...(truncated)' : ''}
\`\`\`

Generate documentation in the following JSON format:

{
  "userDocumentation": {
    "title": "Clear, user-friendly title",
    "overview": "Brief overview of what changed and why it matters",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "screenshots": ["Description of screenshot 1", "Description of screenshot 2"],
    "tips": ["Helpful tip 1", "Helpful tip 2"],
    "troubleshooting": ["Common issue 1 and solution", "Common issue 2 and solution"]
  },
  "technicalDocumentation": {
    "apiChanges": "Detailed API changes if applicable",
    "breaking": false,
    "migration": "Migration guide if breaking changes",
    "codeExamples": ["Example 1", "Example 2"]
  },
  "trainingMaterial": {
    "videoScript": "Complete narration script for a training video (2-3 minutes)",
    "duration": "2-3 minutes",
    "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
    "quizQuestions": [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 0,
        "explanation": "Why this is correct"
      }
    ]
  },
  "releaseNotes": {
    "version": "Extract from commit or generate",
    "highlights": ["Highlight 1", "Highlight 2"],
    "improvements": ["Improvement 1", "Improvement 2"],
    "bugFixes": ["Bug fix 1", "Bug fix 2"]
  }
}

Make the documentation:
- Clear and concise
- Action-oriented
- Suitable for both technical and non-technical audiences
- Include specific examples
- Highlight benefits to users`;
    }

    /**
     * Validate and enhance generated documentation
     */
    private validateAndEnhanceDocumentation(doc: any, change: CodeChange): Documentation {
        // Ensure all required fields exist
        const validated: Documentation = {
            userDocumentation: {
                title: doc.userDocumentation?.title || `Update: ${change.commitMessage}`,
                overview: doc.userDocumentation?.overview || '',
                steps: doc.userDocumentation?.steps || [],
                screenshots: doc.userDocumentation?.screenshots || [],
                tips: doc.userDocumentation?.tips || [],
                troubleshooting: doc.userDocumentation?.troubleshooting || []
            },
            technicalDocumentation: {
                apiChanges: doc.technicalDocumentation?.apiChanges || '',
                breaking: doc.technicalDocumentation?.breaking || false,
                migration: doc.technicalDocumentation?.migration || '',
                codeExamples: doc.technicalDocumentation?.codeExamples || []
            },
            trainingMaterial: {
                videoScript: doc.trainingMaterial?.videoScript || '',
                duration: doc.trainingMaterial?.duration || '2-3 minutes',
                keyPoints: doc.trainingMaterial?.keyPoints || [],
                quizQuestions: doc.trainingMaterial?.quizQuestions || []
            },
            releaseNotes: {
                version: doc.releaseNotes?.version || 'Next Release',
                highlights: doc.releaseNotes?.highlights || [],
                improvements: doc.releaseNotes?.improvements || [],
                bugFixes: doc.releaseNotes?.bugFixes || []
            }
        };

        return validated;
    }

    /**
     * Generate video script from documentation
     */
    async generateVideoScript(documentation: Documentation): Promise<{
        script: string;
        scenes: Array<{
            duration: number;
            narration: string;
            actions: string[];
            highlights: string[];
        }>;
    }> {
        const prompt = `Create a detailed video script from this documentation:

**Title:** ${documentation.userDocumentation.title}
**Overview:** ${documentation.userDocumentation.overview}
**Steps:** ${documentation.userDocumentation.steps.join(', ')}

Generate a video script with:
1. Introduction (10-15 seconds)
2. Step-by-step walkthrough (main content)
3. Tips and best practices (15-20 seconds)
4. Conclusion (10 seconds)

Return JSON:
{
  "script": "Full narration script",
  "scenes": [
    {
      "duration": 15,
      "narration": "Welcome to...",
      "actions": ["Show dashboard", "Highlight new feature"],
      "highlights": ["Feature button", "Menu item"]
    }
  ]
}`;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.6
        });

        return JSON.parse(response.choices[0].message.content || '{}');
    }

    /**
     * Update training modules based on changes
     */
    async updateTrainingModules(documentation: Documentation, affectedModules: string[]): Promise<void> {
        // This would integrate with your training system
        // For now, we'll create update instructions

        for (const moduleId of affectedModules) {
            const updateInstructions = await this.generateModuleUpdate(moduleId, documentation);

            // Save to file or database
            const outputPath = path.join(this.repoPath, 'training-updates', `${moduleId}.json`);
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await fs.writeFile(outputPath, JSON.stringify(updateInstructions, null, 2));

            console.log(`✅ Generated update for module: ${moduleId}`);
        }
    }

    /**
     * Generate module update instructions
     */
    private async generateModuleUpdate(moduleId: string, documentation: Documentation): Promise<any> {
        return {
            moduleId,
            timestamp: new Date().toISOString(),
            updates: {
                content: documentation.userDocumentation,
                videoScript: documentation.trainingMaterial.videoScript,
                quiz: documentation.trainingMaterial.quizQuestions
            },
            requiresReview: true
        };
    }

    /**
     * Generate changelog entry
     */
    async generateChangelog(changes: CodeChange[]): Promise<string> {
        const prompt = `Generate a changelog entry from these commits:

${changes.map(c => `- ${c.commitMessage} (${c.type})`).join('\n')}

Format as markdown with sections:
## [Version] - Date
### Added
### Changed
### Fixed
### Deprecated

Be concise but informative.`;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5
        });

        return response.choices[0].message.content || '';
    }

    /**
     * Analyze UI changes via screenshot comparison
     */
    async detectUIChanges(beforeScreenshot: Buffer, afterScreenshot: Buffer): Promise<{
        hasChanges: boolean;
        changes: string[];
        severity: 'minor' | 'moderate' | 'major';
    }> {
        // This would use computer vision to compare screenshots
        // For now, return a placeholder
        return {
            hasChanges: true,
            changes: ['New button added', 'Layout adjusted', 'Color scheme updated'],
            severity: 'moderate'
        };
    }
}

// Export singleton
let docService: AutoDocumentationService | null = null;

export function getDocumentationService(apiKey?: string, repoPath?: string): AutoDocumentationService {
    if (!docService) {
        const key = apiKey || process.env.OPENAI_API_KEY;
        const path = repoPath || process.cwd();

        if (!key) {
            throw new Error('OpenAI API key not provided');
        }

        docService = new AutoDocumentationService(key, path);
    }
    return docService;
}
