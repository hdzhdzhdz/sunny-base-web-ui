# Project Context & AI Agent Rules

## Project Overview
This project is a Vue 3 Monorepo using:
- **Vue 3** (Script Setup, Composition API)
- **TypeScript**
- **Vite** (Build tool)
- **Arco Design Vue** (Base UI Component Library)
- **@ui** (Internal Business Component Library, wrapping Arco Design)
- **Tailwind CSS** (Utility-first CSS)

## Key Libraries & Conventions

### UI Components
- **Base**: We use [Arco Design Vue](https://arco.design/vue/docs/start) as the foundation.
- **Internal (@ui)**: Custom business components are located in `packages/@ui`.
  - Always prefer using `@ui` components over raw Arco components when a business wrapper exists (e.g., `SunnyForm`, `SunnyQueryGrid`).
  - The `@ui` library is a secondary development based on Arco Design.

### Documentation for AI
We provide specialized context files for AI agents:
- **Arco Design Vue Docs**: `/docs/src/public/arco-llm.txt` (or hosted at `/arco-llm.txt` when running docs).
- **Project Components**: `/docs/src/public/llms.txt`.

## Coding Guidelines
1. **Vue 3**: Use `<script setup lang="ts">`.
2. **Styling**: Prefer Tailwind CSS classes over custom CSS.
3. **Imports**: Use aliased imports where possible (e.g., `@sunny-base-web/ui`).
4. **Icons**: Use `@sunny-base-web/icons` or the project's standardized icon solution.

## Development Workflow

### Package Management
- **Package Manager**: pnpm (Workspace)
- **Monorepo Tool**: Turbo (task orchestration & caching)

### Common Commands
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all code with Prettier

### Package Dependencies
```
apps/web
  ├── @sunny-base-web/ui         # Core UI components
  ├── @sunny-base-web/utils      # Shared utilities
  ├── @sunny-base-web/stores     # State management (Pinia)
  ├── @sunny-base-web/locales    # Internationalization
  ├── @sunny-base-web/icons      # Icon components
  ├── @sunny-base-web/effects    # Interactive components
  └── @sunny-base-web/constants  # Shared constants
```

## Detailed Specifications

For detailed engineering standards, see `.claude/rules/`:

### Core Rules
- **[`rules/general.md`](.claude/rules/general.md)** - General development standards (Git, TypeScript, testing, etc.)

### Package-Specific Rules
- **[`rules/packages/ui.md`](.claude/rules/packages/ui.md)** - Complete UI component development specification
- **[`rules/packages/utils.md`](.claude/rules/packages/utils.md)** - Utilities library specification
- **[`rules/packages/stores.md`](.claude/rules/packages/stores.md)** - State management specification
- **[`rules/packages/locales.md`](.claude/rules/packages/locales.md)** - Internationalization specification
- **[`rules/packages/icons.md`](.claude/rules/packages/icons.md)** - Icon library specification
- **[`rules/packages/effects.md`](.claude/rules/packages/effects.md)** - Interactive components specification
- **[`rules/packages/config.md`](.claude/rules/packages/config.md)** - Configuration constants specification

### Application-Specific Rules
- **[`rules/apps/web.md`](.claude/rules/apps/web.md)** - Web application development specification

### Documentation Rules
- **[`rules/docs/vitepress.md`](.claude/rules/docs/vitepress.md)** - VitePress documentation specification

> 💡 **Tip**: Check [`rules/README.md`](.claude/rules/README.md) for a complete index of all rules.

## When Answering Questions
1. **Check for Existing Components**: Before suggesting a new implementation, check if an existing component in `@ui` handles the use case.
2. **Refer to Arco Docs**: For standard UI behavior, refer to the Arco Design Vue patterns provided in the context.
3. **Monorepo Structure**: Be aware of the monorepo structure (`apps/web`, `packages/*`, `docs/`).
4. **Follow Standards**: When creating/modifying code, refer to the relevant rules in `.claude/rules/`:
   - UI components → [`rules/packages/ui.md`](.claude/rules/packages/ui.md)
   - General standards → [`rules/general.md`](.claude/rules/general.md)
   - Package-specific → Check the package's rule file
