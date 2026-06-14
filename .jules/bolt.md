## 2026-06-14 - Replace O(n²) nested loop with O(n) hash map lookup
**Learning:** In hierarchical structures with arbitrary parent-child relations, dynamic parent lookups inside iteration paths create an O(N^2) bottleneck. Constructing an upfront O(1) map eliminates this cost.
**Action:** Construct a lookup map prior to iterating over tasks to safely verify parent expansion state without performance degradation.
