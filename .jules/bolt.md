## 2026-06-11 - O(N²) Traversals in Hierarchical Lists
**Learning:** When traversing a flat list representing a hierarchy (e.g. tracking parent IDs to see if any ancestor is collapsed), repeatedly searching the list for parents creates an O(N²) bottleneck, particularly for deeply nested or long lists.
**Action:** Always construct an O(1) Map (`new Map(items.map(i => [i.id, i]))`) fully populated *before* traversing or filtering to ensure efficient O(N) resolution.
