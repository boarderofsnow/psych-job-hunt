import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Favorites from './pages/Favorites';
import Applications from './pages/Applications';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <h1>Psychiatry Job Search</h1>
          <nav className="nav">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              All Jobs
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Favorites
            </NavLink>
            <NavLink to="/applications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Applications
            </NavLink>
          </nav>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/applications" element={<Applications />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
