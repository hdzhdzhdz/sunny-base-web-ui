# Implementation Plan: SunnySearchModal

## Phase 1: Preparation & Scaffolding
- [ ] **Create Directory**: `packages/@ui/src/composite/search-modal/`
- [ ] **Define Types**: Create `types.ts` defining `Props` (with `sqlNum`, `conditions`, `fieldNames`), `Emits`, `SearchConfig`.
- [ ] **Create Component Shell**: Create `SunnySearchModal.vue` and `index.ts`.
- [ ] **Define Parameter Mapping**: Ensure data flow handles `sqlNum` and `conditions`.

## Phase 2: Logic Implementation (`use-sunny-search-modal.ts`)
- [x] **State Management**:
  - `loading`: loading state for config fetching.
  - `config`: store the fetched configuration.
  - `selectedRows`: reactive array for selected items.
  - `searchParams`: reactive object for form model.
- [x] **Config Loader**: Implement `fetchConfig(sqlNum)`.
- [x] **Selection Logic**:
  - Pass `cNum` and `token` in the request.
  - **Cross-page**: Enable `checkboxConfig.reserve = true` and ensure `rowKey` is set.
  - **Row Trigger**: Set `checkboxConfig.trigger = 'row'` for click-to-select.
  - **Double Click**: Handle `cell-dblclick` event to trigger `handleOk` (Confirm & Close).
  - Implement `removeRow(row)`: logic for the "X" button in the right sidebar.
  - Sync with Table's checkbox selection.

## Phase 3: UI Implementation
- [x] **Layout**: Implement the Split Layout with **Fixed/Max Height** (e.g., 500px) for the body content to prevent jitter.
- [x] **Responsive Form**: Configure `SunnyForm` using `props.commonConfig` (defaulting to responsive grid in `colProps`) to achieve responsive layout.
- [x] **Table Integration**: Integrate `SunnyQueryGrid` (or `vxe-grid`) with dynamic columns. **Disable default grid pagination**.
- [x] **Modal Header**: Customize Modal Header to display Title and **Help Tip** ("💡 支持跨页多选，双击行快速确认") near the close button.
- [x] **Custom Footer**: Implement a custom Modal Footer containing:
    - **Left**: Pagination controls (Total, Prev/Next).
    - **Right**: Cancel/Confirm buttons.
- [x] **Right Sidebar**: Render `selectedRows` using a list/tag style with remove buttons. Use `props.fieldNames.label` for display text.

## Phase 4: Integration & Testing
- [x] **Demo Page**: Create a demo in `docs/` or a test playground to simulate the `sqlNum` response.
- [x] **Verification**:
  - Verify "Select All" in table updates the sidebar correctly.
  - Verify removing from sidebar updates the table checkbox state.
  - Verify Search updates table data but *keeps* selection.

## Phase 5: Refinement
- [x] **I18n**: Ensure all texts use `$t`.
- [x] **Styling**: Polish margins, paddings, and borders using Tailwind and Arco variables.

## Additional Features (Implemented)
- [x] **Static Config Support**: Allow passing configuration directly via props.
- [x] **Manual Selection Management**: Robust cross-page selection support via manual state tracking.
- [x] **Help Message**: Use `helpMessage` prop with standard icon.