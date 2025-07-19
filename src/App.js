import React from "react";
import Auth from "./Auth";
import './App.css';

function App() {
  return (
    <div className="app-container" style={{ background: '#f5f6fa', minHeight: '100vh', position: 'relative' }}>
      <Auth />
      <footer style={{
        width: '100%',
        textAlign: 'center',
        color: '#aaa',
        fontSize: 14,
        marginTop: 40,
        marginBottom: 12,
        letterSpacing: 1,
        position: 'fixed',
        left: 0,
        bottom: 0,
        background: 'rgba(255,255,255,0.8)',
        zIndex: 9999
      }}>
        © 2025 Eva Huang
      </footer>
    </div>
  );
}

export default App;
