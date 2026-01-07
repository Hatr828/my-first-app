import { useMemo } from 'react';
import './App.css';

const clubProfile = {
  name: 'North Harbor FC',
  city: 'Saint Petersburg',
  founded: 1924,
  stadium: 'Aurora Park',
  coach: 'Daria Volkova',
};

const achievements = [
  { label: 'League titles', value: 6 },
  { label: 'National cups', value: 4 },
  { label: 'Goals scored', value: 312 },
  { label: 'Clean sheets', value: 128 },
];

const squad = [
  { name: 'Kirill Antonov', position: 'Goalkeeper' },
  { name: 'Maksim Belov', position: 'Center back' },
  { name: 'Oleg Sidorov', position: 'Right back' },
  { name: 'Roman Pavlov', position: 'Midfielder' },
  { name: 'Ilya Petrov', position: 'Forward' },
  { name: 'Denis Orlov', position: 'Winger' },
];

const themeClasses = [
  'theme-sunset',
  'theme-forest',
  'theme-ocean',
  'theme-gold',
];

function ClubInfo({ club, themeClass }) {
  return (
    <section className={`card club-info ${themeClass}`}>
      <h2 className="card-title">Club snapshot</h2>
      <ul className="info-list">
        <li>
          <span>Club</span>
          <strong>{club.name}</strong>
        </li>
        <li>
          <span>City</span>
          <strong>{club.city}</strong>
        </li>
        <li>
          <span>Founded</span>
          <strong>{club.founded}</strong>
        </li>
        <li>
          <span>Stadium</span>
          <strong>{club.stadium}</strong>
        </li>
        <li>
          <span>Head coach</span>
          <strong>{club.coach}</strong>
        </li>
      </ul>
    </section>
  );
}

function ClubAchievements({ items }) {
  return (
    <section className="card">
      <h2 className="card-title">Achievements</h2>
      <div className="stats-grid">
        {items.map((item) => (
          <div key={item.label} className="stat">
            <span className="stat-value">{item.value}</span>
            <span className="stat-label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClubSquad({ players }) {
  return (
    <section className="card">
      <h2 className="card-title">Current squad</h2>
      <ul className="squad-list">
        {players.map((player) => (
          <li key={player.name}>
            <span>{player.name}</span>
            <strong>{player.position}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  const themeClass = useMemo(() => {
    const index = Math.floor(Math.random() * themeClasses.length);
    return themeClasses[index];
  }, []);

  return (
    <div className="App">
      <main className="page">
        <header className="page-header">
          <p className="eyebrow">Football club profile</p>
          <h1>{clubProfile.name}</h1>
        </header>
        <div className="grid">
          <ClubInfo club={clubProfile} themeClass={themeClass} />
          <ClubAchievements items={achievements} />
          <ClubSquad players={squad} />
        </div>
      </main>
    </div>
  );
}

export default App;
