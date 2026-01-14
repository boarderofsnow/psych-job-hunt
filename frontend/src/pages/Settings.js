import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPreferences, updatePreferences, getAvailableLocations } from '../services/api';

const DEFAULT_LOCATIONS = [
  'Madison, WI',
  'Boulder, CO',
  'Fort Collins, CO',
  'Raleigh, NC',
  'Durham, NC'
];

function Settings() {
  const { user, signOut } = useAuth();
  const [locations, setLocations] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefsData, availData] = await Promise.all([
          getPreferences(),
          getAvailableLocations()
        ]);
        setLocations(prefsData.locations || DEFAULT_LOCATIONS);
        setAvailableLocations(availData.available || []);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setLocations(DEFAULT_LOCATIONS);
        setAvailableLocations(DEFAULT_LOCATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleLocation = (loc) => {
    setLocations(prev => {
      if (prev.includes(loc)) {
        return prev.filter(l => l !== loc);
      } else {
        return [...prev, loc];
      }
    });
    setSuccess('');
  };

  const handleSave = async () => {
    if (locations.length === 0) {
      setError('Please select at least one location');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updatePreferences(locations);
      setSuccess('Preferences saved successfully!');
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2>Settings</h2>

        <div className="settings-section">
          <h3>Account</h3>
          <p className="settings-email">{user?.email}</p>
          <button onClick={handleSignOut} className="btn btn-secondary">
            Sign Out
          </button>
        </div>

        <div className="settings-section">
          <h3>Location Preferences</h3>
          <p className="settings-description">
            Select the locations where you want to search for psychiatry jobs.
            The scraper will search these locations daily.
          </p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="location-grid">
            {availableLocations.map(loc => (
              <label key={loc} className="location-checkbox">
                <input
                  type="checkbox"
                  checked={locations.includes(loc)}
                  onChange={() => toggleLocation(loc)}
                />
                <span>{loc}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
