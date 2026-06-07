## 2024-06-07 - Replace O(N²) nested loop with O(1) hash map lookup
**Learning:** Hierarchical state updates trigger full re-renders where nested parent lookups (`findTask`) in array loops cause O(N²) bottlenecks.
**Action:** Always construct an O(1) ID-based Map prior to traversing or filtering hierarchical arrays to prevent unnecessary linear scans.
