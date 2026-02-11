# Sunny Base Web Constitution

## Core Principles

### I. Configuration-Driven Development

All complex components (Form, Grid, Search, etc.) MUST support schema/config-driven rendering to enable low-code and dynamic use cases.

- **Rule**: Configuration schemas MUST be standardized with typed interfaces (e.g., field, type, props, slot, hidden)
- **Rule**: Config structures MUST support extension for custom sub-components
- **Rule**: Component logic MUST be separable from UI rendering via `useXxx` hooks
- **Rationale**: Enables runtime flexibility, testability, and future low-code platform integration

### II. Component Reuse Hierarchy

Components MUST follow strict reuse rules to prevent duplication and ensure consistency.

- **Rule**: PREFER `@ui` components over raw Arco Design components
- **Rule**: Composite components (SearchModal = Modal + Form + Table) MUST reuse `@ui` Sunny*-prefixed components
- **Rule**: NEVER directly use Arco components in composite business components
- **Rationale**: Maintains consistent styling, behavior, and reduces maintenance overhead

### III. TypeScript Strict Mode

TypeScript strict mode is NON-NEGOTIABLE across all packages.

- **Rule**: All packages MUST have `strict: true` in `tsconfig.json`
- **Rule**: All exported functions MUST have JSDoc comments
- **Rule**: NO `any` types allowed without explicit justification comment
- **Rule**: Component Props MUST be explicitly typed via TypeScript interfaces
- **Rationale**: Type safety prevents runtime errors and improves developer experience

### IV. Hook + Component Separation

Complex components (code >200 lines, async logic, multi-state) MUST separate logic from UI.

- **Rule**: Business logic lives in `use-sunny-[component].ts` hooks
- **Rule**: Components ONLY accept props, slots, and hook-exposed state/methods
- **Rule**: Hooks handle all state management, API interaction, event handling, config parsing
- **Rationale**: Testability, reusability, and clear separation of concerns

### V. Arco Design Extension (Not Replacement)

`@ui` is a secondary development layer on top of Arco Design Vue.

- **Rule**: MUST preserve all Arco props/events/slots - full passthrough
- **Rule**: ONLY extend for missing capabilities, never redefine existing behavior
- **Rule**: Arco CSS variables MUST be used for theming (no hardcoded colors)
- **Rationale**: Maintains upstream compatibility and leverages Arco's mature features

### VI. Tailwind-First Styling

Styling MUST prioritize Tailwind CSS utility classes over custom CSS.

- **Rule**: Use Tailwind classes for layout, spacing, colors, typography
- **Rule**: Custom CSS ONLY for component-specific needs with `<style scoped>`
- **Rule**: Custom variables defined in `tokens.css` with `--ui-*` prefix
- **Rationale**: Consistency, smaller bundle size, and maintainability

### VII. Internationalization (i18n) Mandatory

ALL user-facing text MUST be internationalized.

- **Rule**: NO hardcoded Chinese strings in component code
- **Rule**: Use `$t('key')` or `{{ $t('key') }}` for all text
- **Rule**: Component-specific texts use `ui.[componentName].*` key pattern
- **Rationale**: Supports multi-language deployments from day one

## Monorepo Architecture

### Package Dependencies

```
apps/web
  ├── @sunny-base-web/ui         # UI components
  ├── @sunny-base-web/utils      # Utilities
  ├── @sunny-base-web/stores     # State (Pinia)
  ├── @sunny-base-web/locales    # i18n
  ├── @sunny-base-web/icons      # Icons
  ├── @sunny-base-web/effects    # Interactive components
  └── @sunny-base-web/constants  # Config
```

**Rules**:
- Apps consume from `packages/`
- `packages/` MAY depend on each other (no cycles)
- Shared dependencies managed via `pnpm workspace` and `catalog`

### Build & Quality Standards

- **Rule**: ALL packages MUST build without errors OR warnings
- **Rule**: Type checking MUST pass (`tsc --noEmit`)
- **Rule**: Linting MUST pass (`eslint --fix`)
- **Rule**: New packages MUST follow `package-template.md` in `.claude/rules/packages/`

### Naming Conventions

- **Components**: `PascalCase` with `Sunny` prefix (e.g., `SunnyForm.vue`)
- **Files**: `kebab-case` (e.g., `use-sunny-form.ts`, `my-feature.ts`)
- **Hooks**: `useSunny[ComponentName]` (PascalCase, matches component)
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Events**: `camelCase` in code, `@kebab-case` in templates

## Documentation Standards

### Code Documentation

- **Rule**: ALL exported functions MUST have JSDoc with `@param`, `@returns`, `@example`
- **Rule**: Complex logic MUST have inline comments explaining "why"
- **Rule**: TODO/FIXME comments MUST reference related issues

### Component Documentation

Each component MUST have:
1. README.md with purpose, props, events, slots, examples
2. At least 2 demos (Basic + Complex) in documentation site
3. API documentation table

### Architecture Documentation

All major architectural decisions MUST be documented in `.claude/rules/`:
- Package-specific rules (ui.md, utils.md, stores.md, etc.)
- App-specific rules (web.md)
- General standards (general.md)

## Development Workflow

### Git Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

types: feat | fix | docs | style | refactor | perf | test | chore | build
scopes: @ui | @utils | @stores | @locales | @icons | @effects | @config | web
```

### Branch Naming

- `master/main` - Main branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Refactoring
- `docs/*` - Documentation

### Code Review Requirements

- **Rule**: ALL changes MUST be reviewed before merging
- **Rule**: Reviewer MUST verify compliance with relevant `.claude/rules/`
- **Rule**: Build MUST pass without errors
- **Rule**: Type checking MUST pass

## Quality Gates

### Before Merging

1. ✅ All tests pass
2. ✅ Type checking passes (`pnpm type-check`)
3. ✅ Linting passes (`pnpm lint`)
4. ✅ Build succeeds (`pnpm build`)
5. ✅ Documentation updated (if applicable)
6. ✅ No `any` types without justification
7. ✅ No hardcoded Chinese strings

### Breaking Changes

- **Rule**: MUST increment MAJOR version
- **Rule**: MUST document migration guide
- **Rule**: MUST update all dependent packages
- **Rule**: MUST announce in changelog

## Technology Stack Constraints

### Required

- **Framework**: Vue 3 (Composition API + Script Setup)
- **Language**: TypeScript (strict mode)
- **Build**: Vite (Library Mode for packages)
- **Package Manager**: pnpm (Workspace)
- **Base UI**: Arco Design Vue 2.x
- **Styling**: Tailwind CSS
- **State**: Pinia

### Prohibited

- Direct use of other UI libraries (Material-UI, AntD, etc.) in `@ui`
- Hardcoded colors/spacing (use Arco Design variables)
- `any` types (without explicit justification)
- Class-based Vue components (use Composition API)

## Governance

### Amendment Process

1. Propose change with rationale
2. Update this constitution
3. Update dependent templates (plan-template.md, spec-template.md, tasks-template.md)
4. Increment version according to semantic versioning
5. Document changes in Sync Impact Report
6. Require team approval for MAJOR changes

### Version Policy

- **MAJOR**: Backward incompatible governance/principle removals
- **MINOR**: New principle/section added or materially expanded
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance

- **Rule**: This constitution supersedes all other practices
- **Rule**: All PRs MUST verify compliance before merging
- **Rule**: Complexity MUST be justified (KISS principle)
- **Rule**: Refer to `.claude/rules/` for runtime development guidance

---

**Version**: 1.0.0 | **Ratified**: 2025-02-11 | **Last Amended**: 2025-02-11

## Sync Impact Report

### Version Change
- Previous: N/A (initial constitution)
- Current: 1.0.0

### Added Sections
- All sections (initial creation)

### Templates Status
- ✅ `.claude/rules/packages/package-template.md` - Already created and aligned
- ✅ `.claude/rules/packages/ui.md` - Already created and aligned
- ✅ `.claude/rules/general.md` - Already created and aligned
- ⚠ `.specify/templates/plan-template.md` - Review needed for constitution checks
- ⚠ `.specify/templates/spec-template.md` - Review needed for scope/requirements alignment
- ⚠ `.specify/templates/tasks-template.md` - Review needed for task categorization

### Follow-up TODOs
- Review and update `.specify/templates/*.md` files to reference constitution principles
- Consider adding automated constitution compliance checks in CI/CD

### Rationale for Version 1.0.0
Initial constitution ratification establishing core development principles for the Sunny Base Web monorepo. Based on existing `.claude/rules/` documentation and project practices established through February 2025.
