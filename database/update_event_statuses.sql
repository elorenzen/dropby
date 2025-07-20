-- Function to update event statuses based on current time
-- This can be called as a scheduled function or trigger

CREATE OR REPLACE FUNCTION update_event_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER := 0;
    now_time TIMESTAMP WITH TIME ZONE := NOW();
    event_record RECORD;
    timeline_count INTEGER := 0;
BEGIN
    -- First, get all events that are about to be closed
    -- We need to capture their details before updating them
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
        
        -- Create timeline item for completed events that had a vendor (were booked)
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
                CASE 
                    WHEN event_record.vendor_name IS NOT NULL THEN
                        'Event with ' || event_record.vendor_name || ' completed at ' || 
                        to_char(event_record.end, 'HH:MI AM') || ' on ' || 
                        to_char(event_record.end, 'Mon DD, YYYY')
                    ELSE
                        'Event completed at ' || to_char(event_record.end, 'HH:MI AM') || 
                        ' on ' || to_char(event_record.end, 'Mon DD, YYYY')
                END,
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

-- Create a scheduled job to run this function every 5 minutes
-- Note: This requires pg_cron extension to be enabled in Supabase
-- You can enable it in the Supabase dashboard under Database > Extensions

-- SELECT cron.schedule(
--     'update-event-statuses',
--     '*/5 * * * *', -- Every 5 minutes
--     'SELECT update_event_statuses();'
-- );

-- Alternative: Create a trigger that runs on INSERT/UPDATE
-- This will check and update status whenever an event is modified

CREATE OR REPLACE FUNCTION check_event_status_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If event has ended, set status to closed
    IF NEW.end < NOW() THEN
        NEW.status := 'closed';
        NEW.updated_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
-- DROP TRIGGER IF EXISTS event_status_trigger ON events;
-- CREATE TRIGGER event_status_trigger
--     BEFORE INSERT OR UPDATE ON events
--     FOR EACH ROW
--     EXECUTE FUNCTION check_event_status_trigger();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_event_statuses() TO authenticated;

-- Example usage:
-- SELECT update_event_statuses(); 