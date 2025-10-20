# Cursor Rules for Daily Budget Bot

This directory contains modular Cursor AI rules for the Daily Budget Bot project. Each rule file focuses on a specific aspect of the codebase.

## Rule Files

### Meta Rules (Priority 0)

- **00-cursor-rules-system.mdc** - Documentation for the cursor rules system itself
- **00-project-overview.mdc** - Project overview and technology stack

### Core Rules (Priority 1)

- **01-language-requirements.mdc** - English-only policy for all code
- **10-security-practices.mdc** - Critical security standards

### Code Quality (Priority 2)

- **02-typescript-standards.mdc** - TypeScript coding standards
- **03-code-formatting.mdc** - Biome formatting rules
- **14-fsm-scene-architecture.mdc** - Modular FSM scene architecture patterns

### Development Practices (Priority 3)

- **04-validation-patterns.mdc** - Zod validation patterns
- **05-logging-standards.mdc** - Winston logging standards
- **15-inline-keyboard-patterns.mdc** - Telegram inline keyboard best practices
- **16-date-formatting-with-date-fns.mdc** - Date formatting with date-fns library

### Integration & Tools (Priority 4)

- **06-google-sheets-integration.mdc** - Google Sheets API usage
- **07-testing-with-vitest.mdc** - Vitest testing framework

### Bot Development (Priority 3)

- **11-telegraf-scenes-fsm.mdc** - Telegraf Scenes and FSM patterns
- **12-constants-and-magic-strings.mdc** - Constants usage patterns
- **13-locale-and-formatting.mdc** - Serbian locale and formatting

### DevOps (Priority 5)

- **08-docker-containerization.mdc** - Docker best practices
- **09-git-flow-workflow.mdc** - Git Flow branching model and workflow

## Usage

Cursor AI will automatically load and apply these rules when working on the project. Rules are organized by priority and topic for easy navigation and maintenance.

## Format

All rule files use the MDC (Markdown Code) format with YAML frontmatter:

```yaml
---
title: Rule Title
description: Brief description
priority: 1-5
tags: [relevant, tags]
---
```

## Updating Rules

When adding or updating rules:

1. Use the MDC format with proper frontmatter
2. Keep rules focused and specific
3. Include code examples (✅ correct / ❌ incorrect)
4. Write in clear, concise English
5. Number files by priority and topic

## Priority Levels

- **Priority 1**: Critical (must follow always)
- **Priority 2**: High (core code quality)
- **Priority 3**: Medium (development practices)
- **Priority 4**: Medium (integrations and tools)
- **Priority 5**: Low (nice to have, workflow)
