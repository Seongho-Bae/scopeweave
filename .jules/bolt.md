## 2026-06-03 - [renderAll O(N^2) optimization]
**Learning:** Found a major performance bottleneck where `renderAll` calls `renderTaskRow` which uses an O(N) array lookup (`state.tasks.some`) for every task, causing an O(N^2) operation. Creating a cached Set of parent IDs transforms this to O(1) lookups, providing huge performance gains for large projects.
**Action:** Always watch out for nested iterations (such as array methods inside loops) and consider using HashMaps/Sets to cache results and turn O(N) lookups into O(1).
