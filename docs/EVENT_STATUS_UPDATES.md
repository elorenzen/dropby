# Automatic Event Status Updates with Supabase

This document explains how to implement automatic event status updates using Supabase database functions, which is the recommended approach for production applications.

## Overview

Events have different statuses:
- `open`: Available for booking
- `booked`: Confirmed with a vendor
- `closed`: Event has ended
- `pending`: Has pending requests

The system automatically updates events from `booked` to `closed` when they end using a database function that runs on a schedule. Additionally, it creates timeline items for completed events that had vendors assigned to them.

## Implementation

### Step 1: Enable pg_cron Extension

1. Go to your **Supabase Dashboard**
2. Navigate to **Database** → **Extensions**
3. Search for `pg_cron` and enable it
4. Click **Enable** to activate the extension

### Step 2: Create the Database Function

1. Go to **SQL Editor** in your Supabase Dashboard
2. Create a new query
3. Copy and paste the following SQL:

```sql
-- Function to update event statuses and create timeline items
CREATE OR REPLACE FUNCTION update_event_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER := 0;
    timeline_count INTEGER := 0;
    now_time TIMESTAMP WITH TIME ZONE := NOW();
    event_record RECORD;
BEGIN
    -- Process each event that needs to be closed
    FOR event_record IN 
        SELECT 
            e.id,
            e.merchant,
            e.vendor,
            e.start,
            e.end,
            e.status,
            m.merchant_name,
            v.vendor_name
        FROM events e
        LEFT JOIN merchants m ON e.merchant = m.id
        LEFT JOIN vendors v ON e.vendor = v.id
        WHERE e.end < now_time 
        AND e.status != 'closed'
    LOOP
        -- Update the event to closed status
        UPDATE events 
        SET 
            status = 'closed',
            updated_at = now_time
        WHERE id = event_record.id;
        
        updated_count := updated_count + 1;
        
        -- Create timeline item for completed events that had a vendor
        IF event_record.vendor IS NOT NULL THEN
            INSERT INTO timeline_items (
                id,
                owner_id,
                title,
                description,
                type,
                created_at
            ) VALUES (
                gen_random_uuid(),
                event_record.merchant,
                'Event Completed',
                'Event with ' || COALESCE(event_record.vendor_name, 'Vendor') || 
                ' completed at ' || to_char(event_record.end, 'HH:MI AM') || 
                ' on ' || to_char(event_record.end, 'Mon DD, YYYY'),
                'event_completed',
                now_time
            );
            
            timeline_count := timeline_count + 1;
        END IF;
    END LOOP;
    
    -- Log the results
    RAISE NOTICE 'Updated % events to closed status', updated_count;
    RAISE NOTICE 'Created % timeline items for completed events', timeline_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_event_statuses() TO authenticated;
```

4. Click **Run** to create the function

### Step 3: Test the Function

Run this SQL to test the function manually:

```sql
-- Test the function
SELECT update_event_statuses();
```

You should see messages like "Updated X events to closed status" and "Created Y timeline items for completed events" in the results.

### Step 4: Set Up Automatic Scheduling

To run the function automatically every 5 minutes, execute this SQL:

```sql
-- Schedule the function to run every 5 minutes
SELECT cron.schedule(
    'update-event-statuses',
    '*/5 * * * *', -- Every 5 minutes
    'SELECT update_event_statuses();'
);
```

## Monitoring

### Check Scheduled Jobs

View all scheduled cron jobs:

```sql
SELECT * FROM cron.job;
```

### View Recent Job Runs

Check recent execution history:

```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

### Test with Sample Data

Create a test event to verify the function works:

```sql
-- Insert a test event that has already ended with a vendor (booked event)
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
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    'booked',
    'Test Location'
);
```

This will test both the status update and timeline item creation.

## Benefits

✅ **Efficient**: Runs directly in the database  
✅ **Reliable**: Works even when your app is down  
✅ **Cost-effective**: No additional API calls  
✅ **Automatic**: No manual intervention needed  
✅ **Scalable**: Handles any number of events  

## Troubleshooting

### Function not found
- Make sure you ran the CREATE FUNCTION statement
- Check that the function exists: `SELECT * FROM information_schema.routines WHERE routine_name = 'update_event_statuses';`

### Permission denied
- Verify pg_cron extension is enabled
- Check that the function has proper permissions

### No events updated
- Verify you have events with past end times
- Check the current time vs event end times

### Scheduled job not running
- Check the cron.job table: `SELECT * FROM cron.job;`
- Verify the cron expression is correct
- Check for errors in cron.job_run_details

### Multiple updates
- The function is idempotent (safe to run multiple times)
- Events already marked as 'closed' won't be updated again

## Cron Expression Reference

The cron expression `*/5 * * * *` means:
- `*/5`: Every 5 minutes
- `*`: Any hour
- `*`: Any day of month
- `*`: Any month
- `*`: Any day of week

Other useful patterns:
- `0 */1 * * *`: Every hour
- `0 0 * * *`: Every day at midnight
- `0 0 * * 0`: Every Sunday at midnight

## Security Considerations

- The function uses `SECURITY DEFINER` to run with elevated privileges
- Only authenticated users can execute the function
- The function only updates events that need status changes
- All updates are logged with timestamps

## Performance Optimization

- The function only processes events that need updates
- Consider running less frequently if you have many events
- Monitor the execution time in cron.job_run_details
- The function is optimized to minimize database load 