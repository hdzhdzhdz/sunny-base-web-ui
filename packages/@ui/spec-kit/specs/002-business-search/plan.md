# Implementation Plan - SunnyBusinessSearch

## Phase 1: Scaffolding & Standards (脚手架与规范)
- [x] **Directory Structure**: Create `packages/@ui/src/composite/business-search` following `constitution.md`.
    - `index.ts` (Export)
    - `SunnyBusinessSearch.vue` (UI)
    - `types.ts` (Type Definitions)
    - `use-sunny-business-search.ts` (Logic Hook)
    - `utils/mapper.ts` (Data Mapping Utils)
    - `configs/` (Static Configs)
- [x] **Type Definitions**: Define strict TypeScript interfaces in `types.ts`.
    - `SunnyBusinessSearchProps` (including `cNum`, `type`, `modalProps`)
    - `BusinessSearchConfig` (FormSchema, Columns, etc.)
    - `DynamicConfigResponse` (Backend response structure)

## Phase 2: Logic Extraction (逻辑抽离)
- [x] **Dynamic Mapper (`utils/mapper.ts`)**:
    - [x] Implement `mapDynamicConfig`: Convert `openInit` response to `SunnySearchModal` config.
    - [x] Implement `mapSearchRequest`: Convert component params to `selectForPageCommon` payload.
- [x] **Logic Hook (`use-sunny-business-search.ts`)**:
    - [x] **State**: Manage `visible`, `currentConfig`, `loading` state.
    - [x] **Config Loader**:
        - Implement `loadDynamicConfig`: Call `openInit` when `cNum` exists.
        - Implement `loadStaticConfig`: Load from `configs/` when `type` exists.
        - Merge logic: Dynamic > Static > Default.
    - [x] **Search Proxy**:
        - Create `createSearchProxy(cNum)` function to wrap `selectForPageCommon`.
    - [x] **Event Handlers**: `handleOpen`, `handleConfirm`.

## Phase 3: Component Implementation (组件实现)
- [x] **SunnyBusinessSearch.vue**:
    - [x] Use `<script setup lang="ts">`.
    - [x] Import `useSunnyBusinessSearch` hook.
    - [x] Template:
        - `SearchInputTag`: Bind `v-model` and click events.
        - `SunnySearchModal`: Bind `visible`, `config` (form/table), and `searchApi`.
    - [x] **Tailwind**: Use utility classes for styling.
    - [x] **I18n**: Ensure all texts are translatable.

## Phase 4: Static Configuration (静态配置)
- [x] **Config Registry**: Implement `configs/index.ts`.
- [x] **Example Config**: Create `configs/user.ts` (User search example) to verify static mode. (Implemented via `registerBusinessConfig` in demo)

## Phase 5: Verification (验证)
- [x] **Demo Page**: Create usage examples in documentation.
    - Case 1: Static Config (Type="user")
    - Case 2: Dynamic Config (cNum="MACHINE_SBBH")
