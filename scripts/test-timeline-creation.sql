-- Test script for timeline item creation when events are completed
-- Run this in Supabase SQL Editor to test the enhanced function

-- First, let's see the current state
SELECT 
    'Current Events' as section,
    id,
    start,
    end,
    status,
    vendor,
    merchant
FROM events 
WHERE status != 'closed'
ORDER BY end DESC
LIMIT 5;

-- Check current timeline items
SELECT 
    'Current Timeline Items' as section,
    id,
    title,
    description,
    type,
    created_at
FROM timeline_items 
ORDER BY created_at DESC
LIMIT 5;

-- Create a test event that has ended with a vendor (booked event)
-- Replace 'your-merchant-id' and 'your-vendor-id' with actual IDs from your database
INSERT INTO events (
    id,
    created_at,
    merchant,
    vendor,
    start,
    end,
    status,
    location_address
) VALUES (
    gen_random_uuid(),
    NOW(),
    (SELECT id FROM merchants LIMIT 1),  -- Use first merchant
    (SELECT id FROM vendors LIMIT 1),    -- Use first vendor
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '1 hour',
    'booked',
    'Test Location for Timeline'
);

-- Run the function to update statuses and create timeline items
SELECT update_event_statuses();

-- Check the results
SELECT 
    'Updated Events' as section,
    id,
    start,
    end,
    status,
    vendor,
    merchant
FROM events 
WHERE status = 'closed'
ORDER BY updated_at DESC
LIMIT 5;

-- Check new timeline items
SELECT 
    'New Timeline Items' as section,
    id,
    title,
    description,
    type,
    created_at
FROM timeline_items 
WHERE type = 'event_completed'
ORDER BY created_at DESC
LIMIT 5;

-- Summary of what happened
SELECT 
    COUNT(*) as total_events_closed,
    MAX(updated_at) as last_update
FROM events 
WHERE status = 'closed' 
AND updated_at > NOW() - INTERVAL '1 hour';

SELECT 
    COUNT(*) as total_timeline_items_created,
    MAX(created_at) as last_timeline_creation
FROM timeline_items 
WHERE type = 'event_completed'
AND created_at > NOW() - INTERVAL '1 hour'; 