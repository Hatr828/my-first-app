import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from './actions';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function TodoFilters() {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state) => state.filter);

  return (
    <div className="filters">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={`filter-button ${
            currentFilter === filter.value ? 'is-active' : ''
          }`}
          onClick={() => dispatch(setFilter(filter.value))}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default TodoFilters;
