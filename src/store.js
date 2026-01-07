import { createStore } from 'redux';
import rootReducer from './reducers';

const storageKey = 'redux-todo-state';

function loadState() {
  if (typeof localStorage === 'undefined') {
    return undefined;
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return undefined;
    }
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function saveState(state) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ignore write errors for unavailable storage.
  }
}

const store = createStore(rootReducer, loadState());

store.subscribe(() => {
  const state = store.getState();
  saveState({
    todos: state.todos,
    filter: state.filter,
  });
});

export default store;
