import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { removeTodo, toggleTodo, updateTodo } from './actions';

function TodoItem({ todo, index }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [error, setError] = useState('');

  const handleToggle = () => {
    dispatch(toggleTodo(todo.id));
  };

  const handleRemove = () => {
    dispatch(removeTodo(todo.id));
  };

  const handleEdit = () => {
    setDraft(todo.text);
    setError('');
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Task text cannot be empty.');
      return;
    }
    dispatch(updateTodo(todo.id, trimmed));
    setIsEditing(false);
    setError('');
  };

  const handleCancel = () => {
    setDraft(todo.text);
    setError('');
    setIsEditing(false);
  };

  return (
    <li
      className={`todo-item ${todo.completed ? 'is-complete' : ''}`}
      style={{ '--delay': `${index * 60}ms` }}
    >
      <button
        className="toggle-button"
        type="button"
        onClick={handleToggle}
        aria-pressed={todo.completed}
      >
        {todo.completed ? 'Done' : 'Mark'}
      </button>
      <div className="todo-body">
        {isEditing ? (
          <div className="edit-area">
            <input
              className="edit-input"
              type="text"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) {
                  setError('');
                }
              }}
            />
            {error ? <span className="field-error">{error}</span> : null}
          </div>
        ) : (
          <>
            <p className="todo-text">{todo.text}</p>
            <span className="todo-status">
              {todo.completed ? 'Completed' : 'Active'}
            </span>
          </>
        )}
      </div>
      <div className="todo-actions">
        {isEditing ? (
          <>
            <button className="ghost-button" type="button" onClick={handleSave}>
              Save
            </button>
            <button className="ghost-button" type="button" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="ghost-button" type="button" onClick={handleEdit}>
              Edit
            </button>
            <button className="ghost-button" type="button" onClick={handleRemove}>
              Remove
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default TodoItem;
