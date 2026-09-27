-- Fix: Remove incorrect issues from Batman series
-- These issues (#15, #411, #485, #489, #490) were created under Batman
-- but belong to "DC Special Series" and "Detective Comics"

-- First, add DELETE policy for issues (was missing)
CREATE POLICY "Authenticated users can delete issues" 
  ON issues FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Delete the wrong issues (they have no edition links)
DELETE FROM issues 
WHERE series_id = 'd7c48d89-14a6-4a94-93e1-7e84c5e05c36'  -- Batman
AND number IN ('15', '411', '485', '489', '490');
