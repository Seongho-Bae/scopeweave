## 2024-05-24 - Avoid O(N^2) array finds during hierarchical traversals
**Learning:** In hierarchical `tasks` arrays, filtering/traversing elements using `findTask()` (or linear searches like `Array.find`) inside loop results in an O(N^2) performance bottleneck.
**Action:** When filtering or transforming hierarchical `tasks` arrays, construct an O(1) lookup map (e.g., `new Map(state.tasks.map(t => [t.id, t]))`) fully before iterating. Parent tasks can appear after their children in the array, leading to `undefined` lookups if the map is populated dynamically during the iteration.
