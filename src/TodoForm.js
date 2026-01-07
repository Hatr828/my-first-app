import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo } from './actions';

function TodoForm() {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Enter a task before adding.');
      return;
    }
    dispatch(addTodo(trimmed));
    setText('');
    setError('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="todo-input">New task</label>
        <input
          id="todo-input"
          className="todo-input"
          type="text"
          placeholder="Add a new task..."
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (error) {
              setError('');
            }
          }}
        />
        {error ? <span className="field-error">{error}</span> : null}
      </div>
      <button className="primary-button" type="submit">
        Add task
      </button>
    </form>
  );
}

export default TodoForm;
