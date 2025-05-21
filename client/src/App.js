import React, { useState } from 'react';

function App() {
  // States
  const [goal, setGoal] = useState('');
  const [limit, setLimit] = useState(5); // default: show 5 items
  const [response, setResponse] = useState('');

  // Handle recommendation request
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goal, limit })
      });

      const data = await res.json();
      setResponse(data.message);
    } catch (err) {
      setResponse('❌ Error connecting to backend.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🏗️ Home Depot Project Planner</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. I want to build a deck"
          style={{ width: '300px', padding: '10px', fontSize: '16px' }}
        />

        <label style={{ marginLeft: '10px' }}>
          Show:
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value={3}>3 items</option>
            <option value={5}>5 items</option>
            <option value={999}>All</option>
          </select>
        </label>

        <button type="submit" style={{ marginLeft: '10px', padding: '10px' }}>
          Get Recommendations
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={async () => {
            try {
              const res = await fetch('http://localhost:5000/api/logs');
              const logs = await res.json();
              setResponse(
                logs.map(log => {
                  return `🕓 ${log.timestamp}\n🧠 ${log.goal}\n🎯 ${log.categoryMatched || 'None'}\n📦 ${log.itemsReturned.join(', ')}`;
                }).join('\n\n')
              );
            } catch (err) {
              setResponse('❌ Failed to load logs.');
              console.error(err);
            }
          }}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          View Past Queries
        </button>

        <button
          onClick={async () => {
            try {
              const res = await fetch('http://localhost:5000/api/logs');
              const logs = await res.json();
              const blob = new Blob([JSON.stringify(logs, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(blob);

              const link = document.createElement('a');
              link.href = url;
              link.download = 'query-log.json';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              URL.revokeObjectURL(url);
            } catch (err) {
              alert("❌ Download failed. Check console.");
              console.error(err);
            }
          }}
          style={{ padding: '10px' }}
        >
          Download Logs
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>🛒 Suggested Items:</h2>
        {response ? (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {response.split('\n').map((line, index) => {
              const match = line.match(/^(.*) \((.*)\) → (.*)$/);
              if (!match) return <li key={index}>{line}</li>;

              const [_, title, price, link] = match;

              return (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <strong>{title}</strong> — <span>{price}</span><br />
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    View on Home Depot
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No suggestions yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;
