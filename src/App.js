import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import './App.css';

const TodoContext = createContext(null);
const storageKey = 'todo-items';

const fallbackTasks = [
  { id: 'task-1', text: 'Plan matchday checklist', completed: false },
  { id: 'task-2', text: 'Send training reminders', completed: true },
  { id: 'task-3', text: 'Update travel roster', completed: false },
];

function loadTasks() {
  if (typeof localStorage === 'undefined') {
    return fallbackTasks;
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return fallbackTasks;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallbackTasks;
  } catch {
    return fallbackTasks;
  }
}

function createTodo(text) {
  return {
    id: `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false,
  };
}

function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [createTodo(action.text), ...state];
    case 'toggle':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'remove':
      return state.filter((todo) => todo.id !== action.id);
    case 'set':
      return action.items;
    default:
      return state;
  }
}

function TodoProvider({ children }) {
  const [tasks, dispatch] = useReducer(todoReducer, [], loadTasks);

  useEffect(() => {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks]);

  const value = useMemo(() => ({ tasks, dispatch }), [tasks, dispatch]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('TodoContext is missing.');
  }
  return context;
}

function TodoSummary() {
  const { tasks } = useTodos();
  const completed = tasks.filter((task) => task.completed).length;
  const remaining = tasks.length - completed;

  return (
    <div className="summary">
      <div>
        <span className="summary-count">{completed}</span>
        <span className="summary-label">done</span>
      </div>
      <div>
        <span className="summary-count">{remaining}</span>
        <span className="summary-label">open</span>
      </div>
    </div>
  );
}

function TodoForm() {
  const { dispatch } = useTodos();
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    dispatch({ type: 'add', text: trimmed });
    setText('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        className="todo-input"
        type="text"
        placeholder="Add a new task..."
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button className="todo-button" type="submit">
        Add task
      </button>
    </form>
  );
}

function TodoList() {
  const { tasks, dispatch } = useTodos();
  const [list, setList] = useState(tasks);

  useEffect(() => {
    setList(tasks);
  }, [tasks]);

  if (list.length === 0) {
    return <p className="empty-state">No tasks yet. Add your first one.</p>;
  }

  return (
    <ul className="todo-list">
      {list.map((task, index) => (
        <li
          key={task.id}
          className={`todo-item ${task.completed ? 'is-complete' : ''}`}
          style={{ '--delay': `${index * 70}ms` }}
          onClick={() => dispatch({ type: 'toggle', id: task.id })}
        >
          <div className="todo-main">
            <span className="todo-title">{task.text}</span>
            <span className="todo-status">
              {task.completed ? 'Done' : 'Active'}
            </span>
          </div>
          <button
            className="todo-remove"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              dispatch({ type: 'remove', id: task.id });
            }}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <TodoProvider>
      <div className="App">
        <main className="app-shell">
          <section className="panel">
            <TodoForm />
            <TodoSummary />
            <TodoList />
          </section>
        </main>
      </div>
    </TodoProvider>
  );
}

export default App;
