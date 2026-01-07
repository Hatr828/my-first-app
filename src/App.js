import { Provider } from 'react-redux';
import store from './store';
import TodoForm from './TodoForm';
import TodoFilters from './TodoFilters';
import TodoList from './TodoList';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <main className="shell">
          <section className="panel">
            <TodoForm />
            <TodoFilters />
            <TodoList />
          </section>
        </main>
      </div>
    </Provider>
  );
}

export default App;
