-- Create intern_projects table
CREATE TABLE IF NOT EXISTS public.intern_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    vercel_link TEXT NOT NULL,
    github_link TEXT NOT NULL,
    linkedin_image_link TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.intern_projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to intern_projects"
    ON public.intern_projects
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated full access to intern_projects"
    ON public.intern_projects
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
