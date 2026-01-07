import { useState } from 'react';
import './App.css';

function WelcomeMessage({ name, greeting }) {
  return (
    <p className="welcome-message">
      {greeting}, {name}!
    </p>
  );
}

function App() {
  const [greetingText, setGreetingText] = useState('Hello');

  const handleToggleGreeting = () => {
    setGreetingText((prev) => (prev === 'Hello' ? 'Welcome back' : 'Hello'));
  };

  return (
    <div className="App">
      <main className="App-card">
        <h1 className="App-title">My first app</h1>
        <WelcomeMessage name="Y" greeting={greetingText} />
        <p className="App-subtitle">Click.</p>
        <button
          className="App-button"
          type="button"
          onClick={handleToggleGreeting}
        >
          Click
        </button>
      </main>
    </div>
  );
}

export default App;
