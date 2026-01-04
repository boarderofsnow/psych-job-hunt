const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

// GET /api/jobs - List all jobs with filters
router.get('/', async (req, res) => {
  try {
    const {
      location,
      status,
      favorite,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        user_jobs (
          id,
          is_favorite,
          status,
          notes,
          applied_date,
          updated_at
        )
      `, { count: 'exact' });

    // Apply filters
    if (location) {
      query = query.eq('search_location', location);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query
      .order('date_posted', { ascending: false, nullsFirst: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Post-filter for status and favorites (since they're in user_jobs)
    let filteredData = data;
    if (status) {
      filteredData = filteredData.filter(job =>
        job.user_jobs?.[0]?.status === status
      );
    }
    if (favorite === 'true') {
      filteredData = filteredData.filter(job =>
        job.user_jobs?.[0]?.is_favorite === true
      );
    }

    res.json({
      jobs: filteredData,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        user_jobs (
          id,
          is_favorite,
          status,
          notes,
          applied_date,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST /api/jobs/:id/favorite - Toggle favorite
router.post('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user_jobs record exists
    const { data: existing } = await supabase
      .from('user_jobs')
      .select('*')
      .eq('job_id', id)
      .maybeSingle();

    if (existing) {
      // Toggle favorite
      const { data, error } = await supabase
        .from('user_jobs')
        .update({
          is_favorite: !existing.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('job_id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } else {
      // Create new record with favorite = true
      const { data, error } = await supabase
        .from('user_jobs')
        .insert({
          job_id: parseInt(id),
          is_favorite: true,
          status: 'new',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// PUT /api/jobs/:id/status - Update application status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'applied', 'interviewing', 'rejected', 'offer'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user_jobs record exists
    const { data: existing } = await supabase
      .from('user_jobs')
      .select('*')
      .eq('job_id', id)
      .maybeSingle();

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'applied' && !existing?.applied_date ? { applied_date: new Date().toISOString().split('T')[0] } : {})
    };

    if (existing) {
      const { data, error } = await supabase
        .from('user_jobs')
        .update(updateData)
        .eq('job_id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from('user_jobs')
        .insert({
          job_id: parseInt(id),
          is_favorite: false,
          ...updateData
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PUT /api/jobs/:id/notes - Update notes
router.put('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if user_jobs record exists
    const { data: existing } = await supabase
      .from('user_jobs')
      .select('*')
      .eq('job_id', id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('user_jobs')
        .update({
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('job_id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } else {
      const { data, error } = await supabase
        .from('user_jobs')
        .insert({
          job_id: parseInt(id),
          is_favorite: false,
          status: 'new',
          notes,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    }
  } catch (error) {
    console.error('Error updating notes:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});

module.exports = router;
