# Status: 001-searchmodal

**Current Status**: Completed
**Last Updated**: 2026-02-07

## Progress
- [x] Specification (Approved)
- [x] Plan (Approved)
- [x] Implementation (Completed)
- [x] Testing (Manual Verified via Demo)

## Notes
- Component implementation moved to `packages/@ui/src/feedback/search-modal/`.
- Docs updated at `docs/src/components/feedback/search-modal.md`.
- Removed `sqlNum` and `conditions`, switched to `formSchema` and `tableColumns` configuration.
- Removed unused `token` prop.
- Implemented `searchApi` callback support.
- Enabled default form actions (Query/Reset buttons) via `show-default-actions`.
- Fixed Internationalization (i18n) for "Selected" and "Clear" labels.
- Added page size selection to pagination (20/50/100/200).
- Updated default width to `800px` and added customizable `width` prop.
- Added `contentHeight` prop (default `300`) to control table area height.
- Implemented full-screen height adaptation: content automatically fills remaining space when maximized.
- Adjusted default form layout columns (`lg: 8, xl: 8, xxl: 8`).
- Fixed close button functionality by binding `model-value` and listening to `close` event.
