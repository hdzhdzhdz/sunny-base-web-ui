# Implementation Plan: SunnySearchModal

## Phase 1: Preparation & Scaffolding
- [ ] **Create Directory**: `packages/@ui/src/feedback/search-modal/`
- [ ] **Define Types**: Update `types.ts` to reflect new props:
  - Remove `sqlNum`, `conditions`.
  - Add `formSchema`, `tableColumns`, `searchApi`.
  - Update `SunnySearchModalProps` interface.
- [ ] **Component Shell**: Update `SunnySearchModal.vue` props definition.
- [ ] **Logic Hook**: Refactor `use-sunny-search-modal.ts` to accept new props and remove config fetching logic.

## Phase 2: Logic Implementation (`use-sunny-search-modal.ts`)
- [ ] **State Management**:
  - Remove `config` state (config is now props).
  - Keep `selectedRows`, `searchParams`.
- [ ] **Search Logic**:
  - Implement `handleSearch`: Collect form data + `searchParams` + Pagination -> Call `props.searchApi`.
  - Handle `searchApi` response and update Table data.
- [ ] **Selection Logic**:
  - **Cross-page**: Enable `checkboxConfig.reserve = true` and ensure `rowKey` is set.
  - **Row Trigger**: Set `checkboxConfig.trigger = 'row'` for click-to-select.
  - **Double Click**: Handle `cell-dblclick` event to trigger `handleOk` (Confirm & Close).
  - Implement `removeRow(row)`: logic for the "X" button in the right sidebar.
  - Sync with Table's checkbox selection.

## Phase 3: UI Implementation
- [ ] **Layout**: Ensure Split Layout with **Fixed/Max Height** (e.g., 500px).
- [ ] **Search Form**: Pass `props.formSchema` to `SunnyForm`.
- [ ] **Table Integration**: Pass `props.tableColumns` to `SunnyQueryGrid` (or `vxe-grid`).
- [ ] **Modal Header**: Display Title and Help Tip.
- [ ] **Custom Footer**: Pagination controls + Action buttons.
- [ ] **Right Sidebar**: Render `selectedRows` using card style.

## Phase 4: Integration & Testing
- [ ] **Demo Page**: Update demo to pass `formSchema`, `tableColumns`, and a mock `searchApi` function.
- [ ] **Verification**:
  - Verify "Select All" in table updates the sidebar correctly.
  - Verify removing from sidebar updates the table checkbox state.
  - Verify Search updates table data but *keeps* selection.
  - Verify `searchApi` is called correctly with parameters.

## Phase 5: Refinement
- [ ] **I18n**: Ensure all texts use `$t`.
- [ ] **Styling**: Polish margins, paddings, and borders.
