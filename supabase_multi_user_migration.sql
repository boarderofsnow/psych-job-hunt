-- Multi-User Migration Script
-- Run this in the Supabase SQL Editor

-- Step 1: Delete existing user_jobs data (clean start for multi-user)
DELETE FROM user_jobs;

-- Step 2: Add user_id column to user_jobs
ALTER TABLE user_jobs ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Step 3: Drop the old unique constraint on job_id only
ALTER TABLE user_jobs DROP CONSTRAINT IF EXISTS user_jobs_job_id_key;

-- Step 4: Add new unique constraint for user_id + job_id combination
ALTER TABLE user_jobs ADD CONSTRAINT user_jobs_user_job_unique UNIQUE(user_id, job_id);

-- Step 5: Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    locations TEXT[] DEFAULT ARRAY['Madison, WI', 'Boulder, CO', 'Fort Collins, CO', 'Raleigh, NC', 'Durham, NC'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Enable Row Level Security
ALTER TABLE user_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for user_jobs
CREATE POLICY "Users can view their own job data"
ON user_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job data"
ON user_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job data"
ON user_jobs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job data"
ON user_jobs FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Allow service role to bypass RLS (for backend operations)
-- The backend uses the service role key, which bypasses RLS by default
-- No additional configuration needed

-- Verify the changes
SELECT 'Migration complete!' as status;
