import React from "react";
import DiaryForm from "./DiaryForm";
import DiaryList from "./DiaryList";
import './App.css';

function App() {
  return (
    <div className="app-container" style={{ background: '#f5f6fa', minHeight: '100vh' }}>
      <DiaryForm />
      <hr />
      <div className="diary-list-title">我的日記</div>
      <DiaryList onlyMine={true} />
    </div>
  );
}

export default App;
