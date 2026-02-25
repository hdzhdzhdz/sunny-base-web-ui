# Project Constitution

## Purpose

This constitution defines the core principles and standards that guide all development decisions in this Vue 3 Monorepo project. All contributors must understand and adhere to these principles to ensure codebase consistency, maintainability, and quality.

---

## 1. Code Quality Principles

### 1.1 Type Safety First
- **No `any` Types**: All code must use TypeScript strict mode. The `any` type is prohibited except in rare, justified cases with accompanying TODO comments.
- **Explicit Typing**: All function parameters, return values, and exported variables must have explicit type annotations.
- **Type Imports**: Use `import type` for type-only imports to enable better tree-shaking.

```typescript
// ✅ Correct
import type { ComponentProps } from './types';
function processData(data: UserData[]): ProcessedResult {
  // ...
}

// ❌ Incorrect
import { ComponentProps } from './types';
function processData(data: any): any {
  // ...
}
```

### 1.2 Single Responsibility
- **Function Size**: Functions should not exceed 50 lines. If longer, refactor into smaller, named functions.
- **File Size**: Files should not exceed 300 lines. Split modules logically when exceeded.
- **Component Focus**: UI components handle presentation only. Business logic belongs in composables/hooks.

### 1.3 Code Organization Standards
- **Import Order**: Follow strict import ordering:
  1. Vue Core
  2. Third-party libraries
  3. Internal packages (@sunny-base-web/*)
  4. Types
  5. Sub-components
- **Named Exports**: Prefer named exports over default exports for better IDE support and refactoring.
- **Barrel Files**: Use `index.ts` files to organize public APIs and hide implementation details.

### 1.4 Documentation Requirements
- **JSDoc Mandate**: All exported functions, types, and interfaces must have JSDoc comments.
- **Component Headers**: Vue components must include a description comment at the top.
- **Inline Comments**: Complex logic must be commented with "why", not "what".
- **TODO/FIXME**: Use standard tags with issue links for tracking.

```typescript
/**
 * Formats user data for display in the profile component
 * @param user - Raw user data from API
 * @param options - Formatting options
 * @returns Formatted user data ready for display
 * @example
 * ```ts
 * formatUserData({ name: 'John' }, { includeEmail: true })
 * ```
 */
export function formatUserData(user: RawUser, options: FormatOptions): FormattedUser {
  // Transform ISO date to locale string for better UX
  // TODO: Add timezone support (Issue #123)
  return { ...user, displayName: user.name.toUpperCase() };
}
```

### 1.5 Error Handling Standards
- **Async Error Handling**: All async operations must use try-catch or .catch()
- **User-Facing Errors**: Display translated, actionable error messages to users
- **Error Logging**: Use console.error for development errors; integrate error tracking in production
- **Never Fail Silently**: Errors must be explicitly handled or re-thrown with context

---

## 2. Testing Standards

### 2.1 Coverage Requirements
- **Core Business Logic**: Minimum 80% coverage
- **Utility Functions**: Minimum 90% coverage
- **UI Components**: Minimum 60% coverage

### 2.2 Testing Structure
All tests follow the AAA pattern (Arrange, Act, Assert):

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do X when Y', () => {
    // Arrange: Set up test data
    const input = { value: 42 };

    // Act: Execute the function
    const result = functionUnderTest(input);

    // Assert: Verify the result
    expect(result).toEqual(expectedOutput);
  });
});
```

### 2.3 Test Categories
- **Unit Tests**: Test pure functions and composables in isolation
- **Component Tests**: Test Vue component behavior using Vitest + Vue Test Utils
- **E2E Tests**: Test critical user journeys (login, checkout, etc.)

### 2.4 Testing Best Practices
- **Test Behavior, Not Implementation**: Focus on what the code does, not how
- **Avoid Test Interdependence**: Tests must run independently in any order
- **Mock External Dependencies**: APIs, databases, and third-party services must be mocked
- **Descriptive Test Names**: Use `should [expected result] when [condition]` pattern

---

## 3. User Experience Consistency

### 3.1 Component Consistency
- **Use @ui Components**: Always prefer internal `@ui` components over raw Arco Design components
- **Arco Design Base**: All components build on Arco Design Vue; respect its patterns
- **Shared Patterns**: Similar functionality across the app must use the same components and patterns

### 3.2 Design System Adherence
- **Color Tokens**: Never hardcode colors. Use Arco Design CSS variables:
  - `var(--color-primary-6)` for primary actions
  - `var(--color-text-1)` for primary text
  - `var(--color-bg-2)` for backgrounds
- **Spacing**: Use Tailwind's spacing scale (4px base unit)
- **Typography**: Follow Arco Design's type scale
- **Responsive Design**: All components must support mobile, tablet, and desktop breakpoints

### 3.3 Internationalization
- **No Hardcoded Strings**: All user-facing text must use i18n
- **Translation Key Pattern**: Use `category.subcategory.key` format
  - `common.*` for reusable text (buttons, messages)
  - `ui.[component].*` for component-specific text
  - `[module].*` for business features
- **Fallback Strategy**: Default to Chinese (zh-CN), show key if translation missing in development

### 3.4 Accessibility Standards
- **Semantic HTML**: Use proper HTML5 elements (`<nav>`, `<main>`, `<button>`)
- **ARIA Labels**: Interactive elements must have accessible labels
- **Keyboard Navigation**: All features must be keyboard-accessible
- **Focus Management**: Modals and dialogs must trap focus appropriately
- **Color Contrast**: Meet WCAG 2.1 AA standards (4.5:1 for text)

### 3.5 Loading & Empty States
- **Always Show Loading**: Use skeleton screens, spinners, or progress bars
- **Empty States**: All list/table views must show friendly empty states
- **Error States**: Display actionable error messages with retry options
- **Optimistic Updates**: Update UI immediately, rollback on error when appropriate

---

## 4. Performance Requirements

### 4.1 Bundle Size Standards
- **Page Initial Load**: Target < 200KB gzipped JavaScript
- **Component Lazy Loading**: All routes and heavy components must use dynamic imports
- **Tree Shaking**: Use ES modules and named exports for optimal tree-shaking
- **Bundle Analysis**: Run bundle analyzer monthly; address regressions

### 4.2 Runtime Performance
- **Frame Budget**: Maintain 60fps (16ms per frame) during interactions
- **List Rendering**: Use virtualization for lists > 100 items
- **Computed Caching**: Leverage Vue's computed properties for expensive calculations
- **Debounce/Throttle**: Apply to search inputs, resize handlers, and scroll events

### 4.3 Asset Optimization
- **Images**: Use WebP format, provide responsive sources, lazy load below-fold images
- **Icons**: Use Lucide icons (preloaded) or Iconify with auto-loading
- **Fonts**: Subset fonts to used characters only; use `font-display: swap`

### 4.4 API & Data Performance
- **Request Batching**: Combine related requests when possible
- **Caching Strategy**: Implement appropriate caching (SWR, stale-while-revalidate)
- **Pagination**: All list endpoints must support pagination
- **Data Minimization**: Only request fields that are actually displayed

### 4.5 Build Performance
- **Build Time**: Full monorepo build must complete in < 5 minutes
- **HMR**: Hot module replacement must work in < 100ms
- **Incremental Builds**: Use Turbo for task caching and incremental builds

---

## 5. Development Workflow Standards

### 5.1 Git Practices
- **Commit Messages**: Follow Conventional Commits specification
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code restructuring
  - `docs:` for documentation changes
- **Branch Naming**: Use `feature/`, `fix/`, `refactor/` prefixes
- **Commit Frequency**: Commit frequently with atomic, focused changes

### 5.2 Code Review Process
- **Self-Review**: Authors must review their own PRs before submission
- **Review Checklist**:
  - [ ] Follows all constitution principles
  - [ ] Includes tests for new functionality
  - [ ] Documentation updated (README, JSDoc)
  - [ ] No console.log or debugging code
  - [ ] TypeScript strict mode passes
- **Approval Requirement**: At least one approval required for merging

### 5.3 Pre-Merge Requirements
- **CI Checks**: All CI checks must pass (lint, type check, tests, build)
- **Test Coverage**: Coverage must not decrease
- **Bundle Size**: No significant bundle size regressions
- **Breaking Changes**: Must be documented in migration guide

---

## 6. Monorepo-Specific Principles

### 6.1 Package Dependencies
- **Direction**: `apps/` depend on `packages/`; `packages/` should avoid depending on `apps/`
- **Circular Dependencies**: Absolutely prohibited
- **Workspace Protocol**: Use workspace protocol (`"@sunny-base-web/ui"`) for internal dependencies
- **Shared Dependencies**: Common dependencies managed in root `package.json`

### 6.2 Package Boundaries
- **@ui**: UI components only (no API calls, no business logic)
- **@effects**: API clients, side effects, business components
- **@stores**: State management only (no direct API calls)
- **@utils**: Pure utility functions only
- **@locales**: i18n configuration only
- **@icons**: Icon components only
- **@config**: Constants and configuration only

### 6.3 Cross-Package Communication
- **Events Over Props**: For deeply nested components, use provide/inject or event bus
- **Types Sharing**: Shared types go in `@utils` or the consuming package
- **API Boundaries**: Each package exposes clean public APIs via `index.ts`

---

## 7. Security Standards

### 7.1 Input Validation
- **Validate All Inputs**: Never trust user input or API responses
- **Type Validation**: Use Zod or similar for runtime validation
- **XSS Prevention**: Vue templates auto-escape; be cautious with `v-html`

### 7.2 Secrets Management
- **No Secrets in Code**: Never commit API keys, tokens, or credentials
- **Environment Variables**: Use `.env` files (gitignored) for local development
- **Production Secrets**: Inject via CI/CD or secure secret management services

### 7.3 Dependency Security
- **Regular Updates**: Update dependencies monthly for security patches
- **Vulnerability Scanning**: Run `npm audit` in CI; block builds on high vulnerabilities
- **License Compliance**: Ensure all dependencies have compatible licenses

---

## 8. Monitoring & Observability

### 8.1 Error Tracking
- **Production Errors**: Integrate error tracking service (Sentry, etc.)
- **Error Context**: Include user ID, route, and action context with errors
- **Error Boundaries**: Vue error boundaries catch component errors gracefully

### 8.2 Performance Monitoring
- **Core Web Vitals**: Track LCP, FID, CLS in production
- **API Performance**: Monitor endpoint response times and failure rates
- **Bundle Size**: Track bundle size over time; alert on regressions

---

## 9. Enforcement & Compliance

### 9.1 Automated Checks
- **ESLint**: Enforce code style and catch common errors
- **TypeScript**: Strict type checking in all packages
- **Prettier**: Automatic code formatting
- **Pre-commit Hooks**: Run linter and tests before allowing commits

### 9.2 CI/CD Gates
- **All Checks Must Pass**: No merge if any CI check fails
- **Coverage Gates**: Block PRs that decrease coverage below thresholds
- **Bundle Size Gates**: Alert on significant bundle size increases

### 9.3 Accountability
- **Code Ownership**: Each package has designated maintainers
- **Review Rotation**: Senior developers review junior developers' PRs
- **Constitution Updates**: Changes require team consensus and documentation update

---

## Appendix: Quick Reference

### Component Checklist
- [ ] TypeScript strict mode, no `any`
- [ ] JSDoc on all exports
- [ ] Uses @ui components, not raw Arco
- [ ] All text internationalized
- [ ] Loading, error, and empty states
- [ ] Responsive design (mobile to desktop)
- [ ] Keyboard accessible
- [ ] Tests with >60% coverage
- [ ] Follows naming conventions

### API Integration Checklist
- [ ] Type definitions for all requests/responses
- [ ] Error handling with user-friendly messages
- [ ] Loading states during requests
- [ ] Request cancellation on component unmount
- [ ] Retry logic for transient failures
- [ ] Appropriate caching strategy

### Performance Checklist
- [ ] Lazy loaded routes and components
- [ ] Virtualized long lists
- [ ] Images optimized and lazy loaded
- [ ] No unnecessary re-renders (use `v-memo`, `computed`)
- [ ] Bundle size analyzed and optimized
- [ ] No memory leaks (cleanup in `onUnmounted`)

---

**Last Updated**: 2025-01-11
**Version**: 1.0.0
**Maintainers**: Development Team
