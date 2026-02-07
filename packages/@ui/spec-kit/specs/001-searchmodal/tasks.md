# Tasks: 001-searchmodal

**Input**: Design documents from `specs/001-searchmodal/`
**Prerequisites**: plan.md (required), specification.md (required)

## Phase 1: Preparation & Scaffolding
- [x] T001 Create Directory Structure `packages/@ui/src/composite/search-modal/`
- [x] T002 Define Types in `types.ts` (`Props` with `sqlNum`, `conditions`, `fieldNames`, `Emits`, `SearchConfig`)
- [x] T003 Create Component Shell `SunnySearchModal.vue` and `index.ts`
- [x] T004 Define Parameter Mapping in `use-sunny-search-modal.ts` (handle `sqlNum`, `conditions`)

## Phase 2: Logic Implementation
- [x] T005 Implement State Management (`loading`, `config`, `selectedRows`, `searchParams`)
- [x] T006 Implement Config Loader `fetchConfig(sqlNum)`
- [x] T007 Implement Selection Logic `toggleRow(row)` and Sync with Table
- [x] T008 [P] Implement Cross-page Selection (`checkboxConfig.reserve = true` + Manual State Sync)
- [x] T009 [P] Implement Row Click Trigger (`checkboxConfig.trigger = 'row'`)
- [x] T010 [P] Implement Double Click Confirm (`cell-dblclick` -> `handleOk`)
- [x] T011 Implement `removeRow(row)` for Right Sidebar

## Phase 3: UI Implementation
- [x] T012 Implement Split Layout with Fixed/Max Height (e.g., 500px)
- [x] T013 Implement Responsive Form using `commonConfig.colProps`
- [x] T014 Integrate `SunnyQueryGrid` with dynamic columns and **Disable default pagination**
- [x] T015 Customize Modal Header with Title and **Help Tip**
- [x] T016 Implement Custom Footer (Left: Pagination, Right: Cancel/Confirm)
- [x] T017 Implement Right Sidebar Custom Card Style (Title+Desc, Tooltip, Fixed Height)

## Phase 4: Integration & Testing
- [x] T018 Create Demo Page in `docs/` to simulate `sqlNum` response
- [x] T019 Verify Selection Logic (Select All, Cross-page, Remove from Sidebar)
- [x] T020 Verify Search Logic (Updates data, keeps selection)

## Phase 5: Refinement
- [x] T021 Apply I18n (`$t`) to all text
- [x] T022 Polish Styling (Tailwind + Arco variables)

## Additional Tasks (Implemented)
- [x] T023 Support Static Config (prop: `staticConfig`)
- [x] T024 Fix Cross-page Selection Loss (Manual `selectedRows` tracking)
- [x] T025 Update Help Message implementation (`helpMessage` prop)