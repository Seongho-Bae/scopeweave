import re

with open("app.js", "r") as f:
    content = f.read()

diff = """<<<<<<< SEARCH
const state = {
  projectName: DEFAULT_PROJECT_NAME,
  baseDate: formatLocalDateInput(new Date()),
  tasks: [],
  editor: {
    mode: null,
    targetId: null,
    parentId: null,
    depth: 1,
    insertAfterId: null,
    draft: null,
    errors: []
  },
  jsonSyncHandle: null,
  dragTaskId: null,
  toastTimer: null
};
=======
const state = {
  projectName: DEFAULT_PROJECT_NAME,
  baseDate: formatLocalDateInput(new Date()),
  tasks: [],
  editor: {
    mode: null,
    targetId: null,
    parentId: null,
    depth: 1,
    insertAfterId: null,
    draft: null,
    errors: [],
    triggerElement: null
  },
  gantt: {
    triggerElement: null
  },
  jsonSyncHandle: null,
  dragTaskId: null,
  toastTimer: null
};
>>>>>>> REPLACE
<<<<<<< SEARCH
function openEditor({ mode, targetId = null, parentId = null, depth = 1, insertAfterId = null, draft = null }) {
  if (mode === 'edit') {
=======
function openEditor({ mode, targetId = null, parentId = null, depth = 1, insertAfterId = null, draft = null }) {
  const triggerElement = document.activeElement;
  if (mode === 'edit') {
>>>>>>> REPLACE
<<<<<<< SEARCH
      insertAfterId: targetId,
      draft: { ...task },
      errors: []
    };
  } else {
=======
      insertAfterId: targetId,
      draft: { ...task },
      errors: [],
      triggerElement
    };
  } else {
>>>>>>> REPLACE
<<<<<<< SEARCH
      draft: draft ? { ...draft } : createEmptyTaskDraft(),
      errors: []
    };
  }
  renderAll();
}

function closeEditor() {
=======
      draft: draft ? { ...draft } : createEmptyTaskDraft(),
      errors: [],
      triggerElement
    };
  }
  renderAll();
  requestAnimationFrame(() => {
    const firstInput = document.querySelector('.editor-panel input:not([type="hidden"])');
    if (firstInput) firstInput.focus();
  });
}

function closeEditor() {
  const triggerElement = state.editor.triggerElement;
>>>>>>> REPLACE
<<<<<<< SEARCH
    depth: 1,
    insertAfterId: null,
    draft: null,
    errors: []
  };
  renderAll();
}
=======
    depth: 1,
    insertAfterId: null,
    draft: null,
    errors: [],
    triggerElement: null
  };
  renderAll();
  if (triggerElement && document.body.contains(triggerElement)) {
    triggerElement.focus();
  }
}
>>>>>>> REPLACE
<<<<<<< SEARCH
function saveEditor() {
  const errors = validateDraft(state.editor.draft, state.editor.depth);
=======
function saveEditor() {
  const triggerElement = state.editor.triggerElement;
  const errors = validateDraft(state.editor.draft, state.editor.depth);
>>>>>>> REPLACE
<<<<<<< SEARCH
  closeEditor();
  persistState();
  renderAll();
  showToast('변경 내용을 저장했습니다.');
}
=======
  closeEditor();
  persistState();
  renderAll();
  showToast('변경 내용을 저장했습니다.');
  if (triggerElement && document.body.contains(triggerElement)) {
    triggerElement.focus();
  }
}
>>>>>>> REPLACE
<<<<<<< SEARCH
function openGanttModal() {
  elements.ganttModal.classList.remove('hidden');
  renderGantt();
}

function closeGanttModal() {
  elements.ganttModal.classList.add('hidden');
}
=======
function openGanttModal() {
  state.gantt.triggerElement = document.activeElement;
  elements.ganttModal.classList.remove('hidden');
  renderGantt();
  requestAnimationFrame(() => {
    if (elements.closeGanttButton) {
      elements.closeGanttButton.focus();
    }
  });
}

function closeGanttModal() {
  elements.ganttModal.classList.add('hidden');
  if (state.gantt.triggerElement && document.body.contains(state.gantt.triggerElement)) {
    state.gantt.triggerElement.focus();
  }
  state.gantt.triggerElement = null;
}
>>>>>>> REPLACE"""

# poor man's replace merge diff
import re

def apply_diff(content, diff):
    blocks = diff.split("<<<<<<< SEARCH\n")[1:]
    for block in blocks:
        search, replace = block.split("\n=======\n")
        replace = replace.split("\n>>>>>>> REPLACE")[0]
        if search not in content:
            print("Failed to find block:\n" + search)
        else:
            content = content.replace(search, replace)
    return content

new_content = apply_diff(content, diff)
with open("app.js", "w") as f:
    f.write(new_content)
