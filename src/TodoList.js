import { useSelector } from 'react-redux';
import TodoItem from './TodoItem';

function getVisibleTodos(todos, filter) {
  switch (filter) {
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'active':
      return todos.filter((todo) => !todo.completed);
    default:
      return todos;
  }
}

function TodoList() {
  const todos = useSelector((state) => state.todos);
  const filter = useSelector((state) => state.filter);
  const visibleTodos = getVisibleTodos(todos, filter);

  if (visibleTodos.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks in this view.</p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {visibleTodos.map((todo, index) => (
        <TodoItem key={todo.id} todo={todo} index={index} />
      ))}
    </ul>
  );
}

export default TodoList;
