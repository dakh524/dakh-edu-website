-- LMS Schema Expansion

-- 1. Students Table (Extending Auth Users and Registrations)
CREATE TABLE IF NOT EXISTS public.students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id uuid REFERENCES auth.users(id), -- Nullable if they haven't signed up yet
  registration_id uuid REFERENCES public.registrations(id),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  intern_number text UNIQUE,
  domain text NOT NULL,
  status text DEFAULT 'Active', -- Active, Suspended, Completed
  progress_percentage integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Modules Table
CREATE TABLE IF NOT EXISTS public.lms_modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL,
  week_number integer NOT NULL,
  title text NOT NULL,
  description text,
  is_published boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Module Contents (Videos, PDFs, Links)
CREATE TABLE IF NOT EXISTS public.lms_module_contents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES public.lms_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text NOT NULL, -- 'Video', 'PDF', 'Link', 'Notes'
  content_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Assignments Table
CREATE TABLE IF NOT EXISTS public.lms_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid REFERENCES public.lms_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  resources_url text,
  enable_resubmission boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS public.lms_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid REFERENCES public.lms_assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  github_link text,
  live_url text,
  zip_url text,
  description text,
  status text DEFAULT 'Pending', -- Pending, Approved, Rejected, Changes Requested
  feedback text,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  graded_at timestamp with time zone
);

-- 6. Student Progress Tracking
CREATE TABLE IF NOT EXISTS public.lms_student_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.lms_modules(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  UNIQUE(student_id, module_id)
);

-- 7. Announcements / Broadcasts
CREATE TABLE IF NOT EXISTS public.lms_announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  target_audience text DEFAULT 'Everyone', -- Everyone, Domain, Batch
  target_value text, -- e.g., 'Web Development' if target_audience is Domain
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for all new tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_module_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_announcements ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Can be refined later)
CREATE POLICY "Public read modules" ON public.lms_modules FOR SELECT USING (true);
CREATE POLICY "Public read contents" ON public.lms_module_contents FOR SELECT USING (true);
CREATE POLICY "Public read assignments" ON public.lms_assignments FOR SELECT USING (true);
CREATE POLICY "Students read own submissions" ON public.lms_submissions FOR SELECT USING (true); -- should check auth.uid() later
CREATE POLICY "Students insert submissions" ON public.lms_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read announcements" ON public.lms_announcements FOR SELECT USING (true);
CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);

-- V2 Updates: Quizzes and Pass Marks
ALTER TABLE public.lms_modules ADD COLUMN IF NOT EXISTS pass_mark integer DEFAULT 0;
ALTER TABLE public.lms_modules ADD COLUMN IF NOT EXISTS quiz_data jsonb;
ALTER TABLE public.lms_modules ADD COLUMN IF NOT EXISTS video_url text; -- For the unlisted Youtube link
ALTER TABLE public.lms_modules ADD COLUMN IF NOT EXISTS task_details text; -- Description of the weekly task
