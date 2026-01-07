import { useRef, useState } from 'react';
import './App.css';

const ratingOptions = [
  { value: '5', label: '5 - Excellent' },
  { value: '4', label: '4 - Good' },
  { value: '3', label: '3 - Okay' },
  { value: '2', label: '2 - Poor' },
  { value: '1', label: '1 - Bad' },
];

const defaultRating = '5';

function FeedbackForm({ onAddReview }) {
  const ratingRef = useRef(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please enter your feedback.');
      return;
    }

    const rating = ratingRef.current
      ? ratingRef.current.value
      : defaultRating;

    onAddReview({
      id: `review-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: trimmed,
      rating,
    });

    setText('');
    setError('');
    if (ratingRef.current) {
      ratingRef.current.value = defaultRating;
    }
  };

  const handleReset = () => {
    setText('');
    setError('');
    if (ratingRef.current) {
      ratingRef.current.value = defaultRating;
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h1 className="panel-title">Feedback form</h1>
      <div className="form-row">
        <label htmlFor="feedback-text">Your feedback</label>
        <textarea
          id="feedback-text"
          className="text-area"
          rows={4}
          placeholder="Share what worked and what could be better..."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {error ? <p className="form-error">{error}</p> : null}
      </div>
      <div className="form-row">
        <label htmlFor="rating-select">Rating</label>
        <select
          id="rating-select"
          className="rating-select"
          defaultValue={defaultRating}
          ref={ratingRef}
        >
          {ratingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button className="primary-button" type="submit">
          Send review
        </button>
        <button className="ghost-button" type="button" onClick={handleReset}>
          Clear
        </button>
      </div>
    </form>
  );
}

function ReviewList({ items }) {
  if (items.length === 0) {
    return (
      <div className="panel empty-panel">
        <h2>No reviews yet</h2>
        <p>Add the first one to see it here.</p>
      </div>
    );
  }

  return (
    <div className="panel review-panel">
      <h2 className="panel-subtitle">Recent reviews</h2>
      <ul className="review-list">
        {items.map((review) => (
          <li key={review.id} className="review-card">
            <div className="review-rating">{review.rating}/5</div>
            <p className="review-text">{review.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [reviews, setReviews] = useState([]);

  const handleAddReview = (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  return (
    <div className="App">
      <main className="shell">
        <FeedbackForm onAddReview={handleAddReview} />
        <ReviewList items={reviews} />
      </main>
    </div>
  );
}

export default App;
