const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

// All preference routes require authentication
router.use(authMiddleware);

// Default locations if user hasn't set preferences
const DEFAULT_LOCATIONS = [
  'Madison, WI',
  'Boulder, CO',
  'Fort Collins, CO',
  'Raleigh, NC',
  'Durham, NC'
];

// GET /api/preferences - Get user preferences
router.get('/', async (req, res) => {
  try {
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.userId)
      .maybeSingle();

    if (error) throw error;

    // Return preferences or defaults
    res.json({
      locations: preferences?.locations || DEFAULT_LOCATIONS,
      hasCustomPreferences: !!preferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /api/preferences - Update user preferences
router.put('/', async (req, res) => {
  try {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({ error: 'locations must be an array' });
    }

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', req.userId)
      .maybeSingle();

    let result;
    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          locations,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', req.userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: req.userId,
          locations,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      locations: result.locations,
      hasCustomPreferences: true
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// GET /api/preferences/locations - Get available location options
router.get('/locations', async (req, res) => {
  // Return all available locations that can be selected
  res.json({
    available: [
      'Madison, WI',
      'Waukesha, WI',
      'Milwaukee, WI',
      'Boulder, CO',
      'Fort Collins, CO',
      'Raleigh, NC',
      'Durham, NC',
      'Atlanta, GA',
      'Macon, GA',
      'Austin, TX',
      'Denver, CO',
      'Seattle, WA',
      'Portland, OR',
      'San Diego, CA',
      'Nashville, TN',
      'Asheville, NC',
      'Minneapolis, MN',
      'Chicago, IL',
      'Boston, MA'
    ]
  });
});

module.exports = router;
