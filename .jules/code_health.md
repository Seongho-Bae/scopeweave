## 2026-06-29 - Code Duplication Fix
**Learning:** Extracting common object mapping logic into a shared helper function (e.g., `normalizeExternalRecord`) and using the spread operator simplifies object creation and ensures consistency across different data import/creation flows.
**Action:** Always look for identical mapping blocks when handling data from various sources (e.g., flat lists vs hierarchical builds) and extract them early to maintain DRY principles.
