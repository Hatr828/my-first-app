import { combineReducers } from 'redux';
import {
  ADD_TODO,
  REMOVE_TODO,
  TOGGLE_TODO,
  UPDATE_TODO,
  SET_FILTER,
} from './actions';

const initialTodos = [
  { id: 'todo-1', text: 'Write the project brief', completed: false },
  { id: 'todo-2', text: 'Review open tasks', completed: true },
];

function todosReducer(state = initialTodos, action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        {
          id: `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          text: action.payload.text,
          completed: false,
        },
        ...state,
      ];
    case REMOVE_TODO:
      return state.filter((todo) => todo.id !== action.payload.id);
    case TOGGLE_TODO:
      return state.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case UPDATE_TODO:
      return state.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, text: action.payload.text }
          : todo
      );
    default:
      return state;
  }
}

function filterReducer(state = 'all', action) {
  switch (action.type) {
    case SET_FILTER:
      return action.payload.filter;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  todos: todosReducer,
  filter: filterReducer,
});

export default rootReducer;
