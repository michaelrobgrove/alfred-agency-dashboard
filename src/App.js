import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Alfred Web Design Agency</h1>
        <p>Dashboard coming soon...</p>
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              color: '#333',
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3>Active Clients</h3>
              <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>0</p>
            </div>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              color: '#333',
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3>Sites Deployed</h3>
              <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>0</p>
            </div>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              color: '#333',
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3>Monthly Revenue</h3>
              <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>$0</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
