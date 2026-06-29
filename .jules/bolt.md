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
## 2026-06-21 - Eliminate O(N) Set Allocations in Render Loops
**Learning:** Instantiating new Sets inside a .filter() callback during hot paths (like renderAll which fires on every keystroke) causes massive memory allocations and garbage collection pauses.
**Action:** Move the Set instantiation outside the iteration loop and reuse it via clear() inside the loop to ensure O(1) allocation overhead per render pass.

## 2026-06-22 - calculateDurationDays 연산의 O(N) 캐싱
**Learning:** computeTaskMetrics 함수 내부에서 각 task마다 calculateDurationDays를 두 번씩 호출하고 있었습니다 (totalDays를 구하기 위한 reduce에서 한 번, map 반복문에서 또 한 번). 이는 불필요한 중복 연산을 발생시켰습니다.
**Action:** 첫 번째 순회(reduce) 단계에서 각 task의 기간을 계산한 후 Map에 캐싱하여, 두 번째 순회(forEach) 단계에서 캐싱된 값을 가져오도록 수정함으로써 중복 연산을 완전히 제거했습니다.

## 2026-06-22 - O(N*Depth) cascade deletion UI freeze
**Learning:** Cascading deletions in hierarchical tree structures (like the tasks array) that re-traverse the entire array per depth level using a `while(changed)` condition cause O(N*Depth) operations. In deep or large trees, this causes a severe UI freeze when removing elements.
**Action:** Always pre-compute a parent-to-children mapping using a single O(1) Map, then use BFS with an index cursor to traverse descendant IDs in O(N) operations without queue shifting.

## 2026-06-23 - Remove redundant O(N * Depth) visible tasks filtering loop
**Learning:** `getVisibleTasks()` filters visible items by checking the expansion state of all ancestors for each task. The previous implementation correctly calculated visible tasks using a single O(N) top-down pass, but redundantly executed a secondary `.filter()` loop using a `taskById` map lookup and a tree traversal to root (`while(parentId)`). This unnecessary loop caused a performance bottleneck (taking ~167ms compared to ~13ms for the single-pass logic for 100 iterations of 2000 tasks).
**Action:** When filtering hierarchical data based on parent state, always rely on a single top-down pass that propagates the hidden state (using a Set or property) instead of traversing the tree to the root for every single item in a redundant `.filter()` loop.
## 2026-06-29 - [Cache Elements to optimize drag-and-drop]
**Learning:** For drag-and-drop operations, avoid repeatedly querying the DOM (e.g., via `querySelectorAll`) to clean up status classes like `.dragging` or `.drop-target`. Caching active elements (e.g., `dragElement`, `dropTargetElement`) within the global `state` object during `dragstart` or `dragover` events gives a substantial performance improvement (O(1) access and cleanup instead of O(N)). Also, in `dragover`, checking `if (state.dropTargetElement !== row)` before applying `.drop-target` avoids DOM thrashing on every mouse move.
**Action:** Next time there is a drag-and-drop event that updates styles, I'll cache the active elements on the global state on `dragstart`/`dragover` and use the cache for cleanup during `dragend`/`dragleave`/`drop`.
