## 2024-06-04 - O(n²) Bottleneck in `getVisibleTasks` Ancestor Lookup
**Learning:** `getVisibleTasks` in this codebase used `findTask(parentId)` (an O(n) array search) inside a `while` loop to traverse up the tree for every task. For a 6,000+ task WBS, this resulted in an O(n²) bottleneck causing ~680ms freezes on every render.
**Action:** When doing multiple ancestor/parent lookups in a flat array representation of a tree, pre-compute an O(n) `Map` or index object to enable O(1) lookups inside loops to avoid unexpected performance cliffs.
