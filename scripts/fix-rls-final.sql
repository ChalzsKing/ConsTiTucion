DROP POLICY IF EXISTS "Users can view their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can insert their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_statistics;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_statistics;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_statistics;

ALTER TABLE user_statistics DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
ON user_statistics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own exam history" ON exam_history;
DROP POLICY IF EXISTS "Users can insert their own exam history" ON exam_history;

ALTER TABLE exam_history DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
ON exam_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE exam_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;

ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
ON user_progress
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily activity" ON daily_activity;
DROP POLICY IF EXISTS "Users can insert their own daily activity" ON daily_activity;
DROP POLICY IF EXISTS "Users can update their own daily activity" ON daily_activity;

ALTER TABLE daily_activity DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
ON daily_activity
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
