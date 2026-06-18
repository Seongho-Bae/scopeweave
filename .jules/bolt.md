## 2024-06-25 - Avoid array cloning for reverse searches in hot paths
**Learning:** Using `[...array].reverse().findIndex(...)` inside frequent loops (like Gantt chart row rendering) causes hidden O(N) memory allocations per call, leading to memory bloat and garbage collection pauses.
**Action:** Use a standard reverse `for` loop (e.g., `for (let i = array.length - 1; i >= 0; i--)`) to eliminate allocation overhead and improve rendering performance.
