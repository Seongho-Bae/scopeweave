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

## 2024-05-18 - .filter()를 이용한 루트 태스크 탐색 비효율 개선
**Learning:** `getLastRootTaskId` 함수에서 마지막 루트 태스크를 찾기 위해 `state.tasks.filter((task) => !task.parentId)`를 호출하면, 마지막 요소 하나를 찾기 위해 전체 배열을 순회하고 새로운 배열을 O(N)으로 할당하는 불필요한 성능 저하가 발생합니다.
**Action:** 배열의 마지막 특정 요소를 찾을 때는, 전체 배열을 스캔하고 할당하는 대신 배열의 끝에서부터 역방향 `for` 루프를 돌아 첫 번째로 매칭되는 즉시 반환하면 불필요한 O(N) 순회 및 메모리 할당을 방지할 수 있습니다.
