## 2026-06-02 - O(N^2) Bottleneck in task rendering
**Learning:** Checking for children tasks with `state.tasks.some` inside a visible tasks render loop (`renderTaskRow`) causes an O(N^2) operation, making the UI very slow for large amounts of rows (e.g. 5000+).
**Action:** Pre-compute a `Set` of parent IDs in `renderAll()` and pass the boolean `hasChildren` down to `renderTaskRow`. This changes the O(N) lookup in every row to an O(1) Set access, reducing rendering bottlenecks significantly while preserving existing behavior.
