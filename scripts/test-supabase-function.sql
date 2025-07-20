-- Test script for the update_event_statuses function
-- Run this in Supabase SQL Editor to test the function

-- First, let's see what events exist and their current status
SELECT 
    id,
    start,
    end,
    status,
    updated_at
FROM events 
ORDER BY end DESC
LIMIT 10;

-- Now run the function to update event statuses
SELECT update_event_statuses();

-- Check the results after running the function
SELECT 
    id,
    start,
    end,
    status,
    updated_at
FROM events 
WHERE status = 'closed'
ORDER BY updated_at DESC
LIMIT 10;

-- Check how many events were updated in the last hour
SELECT 
    COUNT(*) as recently_closed_events,
    MAX(updated_at) as last_update
FROM events 
WHERE status = 'closed' 
AND updated_at > NOW() - INTERVAL '1 hour'; 