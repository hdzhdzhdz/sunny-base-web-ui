# Tasks: 001-searchmodal

**Input**: Design documents from `specs/001-searchmodal/`
**Prerequisites**: plan.md (required), specification.md (required)

## Phase 1: Preparation & Scaffolding
- [x] T001 Create Directory Structure `packages/@ui/src/feedback/search-modal/`
- [x] T002 Update Types in `types.ts` (Remove `sqlNum`/`conditions`, Add `formSchema`/`tableColumns`/`searchApi`)
- [x] T003 Update Component Props in `SunnySearchModal.vue`
- [x] T004 Refactor `use-sunny-search-modal.ts` to remove config fetching logic

## Phase 2: Logic Implementation
- [x] T005 Implement `handleSearch` using `props.searchApi`
- [x] T006 Update State Management (Remove `config` state)
- [x] T007 Implement Selection Logic (Sync with Table, Manual State)
- [x] T008 Implement Cross-page Selection (`checkboxConfig.reserve = true`)
- [x] T009 Implement Row Click Trigger (`checkboxConfig.trigger = 'row'`)
- [x] T010 Implement Double Click Confirm (`cell-dblclick`)
- [x] T011 Implement `removeRow` for Right Sidebar

## Phase 3: UI Implementation
- [x] T012 Update `SunnyForm` usage to use `props.formSchema`
- [x] T013 Update `SunnyQueryGrid` usage to use `props.tableColumns`
- [x] T014 Verify Split Layout and Fixed Height
- [x] T015 Customize Modal Header and Footer
- [x] T016 Implement Right Sidebar Card Style

## Phase 4: Integration & Testing
- [x] T017 Create/Update Demo Page with Mock Data and Config
- [x] T018 Verify Search Functionality (API call + Table Update)
- [x] T019 Verify Selection Functionality (Cross-page, Remove, Sync)

## Phase 5: Refinement
- [x] T020 Apply I18n
- [x] T021 Polish Styling
