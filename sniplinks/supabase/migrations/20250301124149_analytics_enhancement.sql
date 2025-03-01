-- Create clicks table for detailed click tracking
CREATE TABLE IF NOT EXISTS clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index for faster queries on link_id and clicked_at
CREATE INDEX IF NOT EXISTS clicks_link_id_idx ON clicks(link_id);
CREATE INDEX IF NOT EXISTS clicks_clicked_at_idx ON clicks(clicked_at);

-- Add RLS policies for clicks table
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Allow read access to clicks for link owners
CREATE POLICY "Users can view clicks for their own links" ON clicks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM links
            WHERE links.id = clicks.link_id
            AND links.user_id = auth.uid()
        )
    );

-- Allow insert for redirect route (public access)
CREATE POLICY "Allow public insert of clicks" ON clicks
    FOR INSERT
    WITH CHECK (true);

-- Add function to update total clicks count
CREATE OR REPLACE FUNCTION update_link_clicks()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE links
    SET clicks = (
        SELECT COUNT(*)
        FROM clicks
        WHERE link_id = NEW.link_id
    )
    WHERE id = NEW.link_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update click count
CREATE TRIGGER update_link_clicks_count
    AFTER INSERT ON clicks
    FOR EACH ROW
    EXECUTE FUNCTION update_link_clicks();

-- Add subscription_tier to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN subscription_tier TEXT DEFAULT 'free' 
        CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));
    END IF;
END $$;