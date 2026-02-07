# Implementation Plan: SunnySearchInputTag

## Phase 1: Preparation & Scaffolding
- [x] **Create Directory**: `packages/@ui/src/entry/search-input-tag/`
- [x] **Define Types**: Create `types.ts` defining `SearchInputTagProps` and `FieldNames`.
- [x] **Create Component Shell**: Create `SearchInputTag.vue` and `index.ts`.

## Phase 2: Logic Implementation
- [x] **Data Mapping**: Implement `displayTags` computed property to map `modelValue` objects to `InputTag` format using `fieldNames`.
- [x] **Interaction Control**:
  - Implement `handleKeyDown` to prevent user input but allow Deletion/Navigation.
  - Implement `handleRemove` to sync tag removal back to `modelValue`.
  - Implement `handleClear` for one-click clearing.
- [x] **Search Trigger**:
  - Add `IconSearch` to the suffix slot.
  - Implement `handleSearch` to emit `search` event.
  - Handle `disabled` state styling for the search icon.

## Phase 3: Styling & Refinement
- [x] **Tailwind Styling**: Use Tailwind classes for layout and hover effects (e.g., `border-l`, `group-hover`).
- [x] **Arco Integration**: Ensure `a-input-tag` props like `max-tag-count` are passed through.
- [x] **Responsiveness**: Ensure `w-full` class is applied.

## Phase 4: Export & Integration
- [x] **Export**: Export component as `SunnySearchInputTag` in `index.ts`.
- [x] **Global Export**: Add to `@ui/src/index.ts`.
