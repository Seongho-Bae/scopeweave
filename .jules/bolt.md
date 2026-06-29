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

## 2024-05-18 - 렌더링 루프 내 고정 크기 캐시를 우회하는 중복 날짜 파싱
**Learning:** `calculateDurationDays`는 500개 고정 크기 캐시(`dateToUtcMsCache`)를 활용하는 날짜 문자열 파싱 로직에 의존합니다. 수백 개 이상의 태스크가 있는 대형 프로젝트에서는 루프당 태스크 지표를 두 번 계산하면 이 캐시가 무력화되어, O(N) 중복 파싱 작업이 발생하고 매 렌더링 사이클마다 상당한 성능 저하가 일어납니다.
**Action:** 렌더링 루프 내의 계산이 무겁거나 캐시가 제한된 작업에 의존하는 경우, 별도의 패스에서 한 번만 계산하고 `Map`과 같은 O(1) 구조에 저장한 다음 메인 집계 루프에서 재사용해야 합니다.
