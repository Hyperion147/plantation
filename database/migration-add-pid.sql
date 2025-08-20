-- Migration to add PID field to existing plants table
-- Run this if you have an existing plants table without the PID field

-- Add PID column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plants' AND column_name = 'pid') THEN
        ALTER TABLE plants ADD COLUMN pid VARCHAR(20);
        
        -- Create a unique index on PID
        CREATE UNIQUE INDEX IF NOT EXISTS idx_plants_pid ON plants(pid);
        
        -- Update existing plants with sequential PIDs starting from 1001
        WITH numbered_plants AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) + 1000 as new_pid
            FROM plants
            WHERE pid IS NULL
        )
        UPDATE plants 
        SET pid = numbered_plants.new_pid::VARCHAR(20)
        FROM numbered_plants 
        WHERE plants.id = numbered_plants.id;
        
        -- Make PID NOT NULL after populating
        ALTER TABLE plants ALTER COLUMN pid SET NOT NULL;
        
        RAISE NOTICE 'PID column added and populated for existing plants';
    ELSE
        RAISE NOTICE 'PID column already exists';
    END IF;
END $$;
