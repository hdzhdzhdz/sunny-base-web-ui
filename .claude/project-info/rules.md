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

## When Answering Questions
1. **Check for Existing Components**: Before suggesting a new implementation, check if an existing component in `@ui` handles the use case.
2. **Refer to Arco Docs**: For standard UI behavior, refer to the Arco Design Vue patterns provided in the context.
3. **Monorepo Structure**: Be aware of the monorepo structure (`apps/web`, `packages/*`, `docs/`).
