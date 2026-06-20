## 2026-06-02 - O(N^2) Bottleneck in task rendering
**Learning:** Checking for children tasks with `state.tasks.some` inside a visible tasks render loop (`renderTaskRow`) causes an O(N^2) operation, making the UI very slow for large amounts of rows (e.g. 5000+).
**Action:** Pre-compute a `Set` of parent IDs in `renderAll()` and pass the boolean `hasChildren` down to `renderTaskRow`. This changes the O(N) lookup in every row to an O(1) Set access, reducing rendering bottlenecks significantly while preserving existing behavior.

## 2025-05-31 - O(N²) Performance Bottleneck in getVisibleTasks

**Learning:** `getVisibleTasks()` filters visible items by checking the expansion state of all ancestors for each task using `findTask(parentId)`. Since `findTask` is an O(N) array search and `getVisibleTasks()` runs on every render, this creates an O(N²) bottleneck that freezes the UI on larger project plans.

**Action:** When performing multiple lookups by ID inside loops (especially during render cycles), always construct an O(1) `Map` or dictionary first. Replaced `findTask(parentId)` with a local `taskById` Map lookup to drop the complexity to O(N).
## 2024-05-18 - Prevent O(N^2) bottlenecks when iterating hierarchical arrays
**Learning:** When detecting cycles or traversing parents in a hierarchical array like `tasks`, repeatedly calling `.find()` inside a loop creates an O(N^2) bottleneck, which is devastating for large CSV imports.
**Action:** Always construct an O(1) lookup map (e.g., `new Map(tasks.map(t => [t.id, t]))`) *before* iterating over the array to ensure O(N) complexity for hierarchical validations.
## 2024-05-18 - [Title] Array spreading and reversing in rendering loops
**Learning:** Using `[...array].reverse().findIndex(...)` in a tight loop (like rendering Gantt chart bars for every task) is an anti-pattern. It creates a brand new copy of the array and then mutates it on every single iteration, leading to massive memory allocation overhead and garbage collection pauses.
**Action:** Always replace `[...array].reverse().findIndex(...)` with a standard reverse `for` loop starting from `array.length - 1` and iterating backwards, especially inside O(N) rendering functions.
## 2024-05-18 - Prevent O(N^2) bottlenecks when grouping arrays
**Learning:** When grouping elements by a key (e.g., grouping timeline days into weeks), using `Array.find` inside a loop creates an O(N^2) bottleneck, as it scans the accumulated groups on every iteration. This negatively impacts rendering performance.
**Action:** Always use an O(1) `Map` or dictionary to keep track of created groups while accumulating them, reducing the grouping complexity to O(N).

## 2024-05-18 - [Fix O(N) Event Listener Accumulation in Render Cycles]
**Learning:** Attaching event listeners (even with `{ once: true }`) inside frequently executed validation/render functions (like `renderEditorValidation` on every keystroke) leads to severe O(N) accumulation on elements that persist between calls. This triggers duplicate handler executions that synchronously block the main thread.
**Action:** Always attach event listeners once during element creation in the initial render logic (`renderEditorRow`), not inside repeated update/validation cycles.
