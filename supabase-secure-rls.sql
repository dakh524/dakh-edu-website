-- Secure RLS Policies for DAKH Edu Solutions
-- This script fixes the critical IDOR/broken access control vulnerability.
-- Run this in your Supabase SQL Editor.

-- 1. Create Helper Function
CREATE OR REPLACE FUNCTION is_admin_or_team() RETURNS boolean AS $$
BEGIN
  RETURN (
    EXISTS (SELECT 1 FROM team_members WHERE email = auth.jwt()->>'email')
    OR (auth.jwt()->>'email' IN ('ceo@dakhedusolutions.in', 'admin@dakhedusolutions.in'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing permissive policies
DROP POLICY IF EXISTS "Public read modules" ON public.lms_modules;
DROP POLICY IF EXISTS "Public read contents" ON public.lms_module_contents;
DROP POLICY IF EXISTS "Public read assignments" ON public.lms_assignments;
DROP POLICY IF EXISTS "Students read own submissions" ON public.lms_submissions;
DROP POLICY IF EXISTS "Students insert submissions" ON public.lms_submissions;
DROP POLICY IF EXISTS "Public read announcements" ON public.lms_announcements;
DROP POLICY IF EXISTS "Public read students" ON public.students;
DROP POLICY IF EXISTS "Public insert students" ON public.students;
DROP POLICY IF EXISTS "Public update students" ON public.students;
DROP POLICY IF EXISTS "Public delete students" ON public.students;
DROP POLICY IF EXISTS "Allow public read access to roadmap_steps" ON public.roadmap_steps;
DROP POLICY IF EXISTS "Allow authenticated insert/update on roadmap_steps" ON public.roadmap_steps;
DROP POLICY IF EXISTS "Allow public insert access to registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow authenticated read/write access to registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public insert access to blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow public read access to blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow authenticated delete on blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated insert/update on events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert access to freelancer_applications" ON public.freelancer_applications;
DROP POLICY IF EXISTS "Allow authenticated read/write access to freelancer_applications" ON public.freelancer_applications;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert/update on products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Allow authenticated insert/update on advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Allow public read access to team_tasks" ON public.team_tasks;
DROP POLICY IF EXISTS "Allow authenticated read/write access to team_tasks" ON public.team_tasks;
DROP POLICY IF EXISTS "Allow public read access to certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow authenticated read/write access to certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow public read access to team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated read/write access to team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow public read access to intern_projects" ON public.intern_projects;
DROP POLICY IF EXISTS "Allow authenticated full access to intern_projects" ON public.intern_projects;
DROP POLICY IF EXISTS "Allow public read access to cold_leads" ON public.cold_leads;
DROP POLICY IF EXISTS "Allow authenticated read/write access to cold_leads" ON public.cold_leads;
DROP POLICY IF EXISTS "Allow public read access to partnered_companies" ON public.partnered_companies;
DROP POLICY IF EXISTS "Allow authenticated read/write access to partnered_companies" ON public.partnered_companies;

-- 3. Create strict policies

-- students
CREATE POLICY "Students can read own data" ON public.students FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Students can update own data" ON public.students FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Admins/Team can full access students" ON public.students FOR ALL USING (is_admin_or_team());

-- registrations (public insert, admin/team read/write)
CREATE POLICY "Public can insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins/Team can full access registrations" ON public.registrations FOR ALL USING (is_admin_or_team());

-- certificates (public read, admin/team read/write)
CREATE POLICY "Public can read certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access certificates" ON public.certificates FOR ALL USING (is_admin_or_team());

-- team_members (admin/team read/write)
CREATE POLICY "Admins/Team can full access team_members" ON public.team_members FOR ALL USING (is_admin_or_team());

-- cold_leads (admin/team read/write)
CREATE POLICY "Admins/Team can full access cold_leads" ON public.cold_leads FOR ALL USING (is_admin_or_team());

-- events (public read, admin/team read/write)
CREATE POLICY "Public can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access events" ON public.events FOR ALL USING (is_admin_or_team());

-- blogs (public read, admin/team read/write)
CREATE POLICY "Public can read blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access blogs" ON public.blogs FOR ALL USING (is_admin_or_team());

-- intern_projects (public read, admin/team read/write)
CREATE POLICY "Public can read intern_projects" ON public.intern_projects FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access intern_projects" ON public.intern_projects FOR ALL USING (is_admin_or_team());

-- advertisements (public read, admin/team read/write)
CREATE POLICY "Public can read advertisements" ON public.advertisements FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access advertisements" ON public.advertisements FOR ALL USING (is_admin_or_team());

-- partnered_companies (public read, admin/team read/write)
CREATE POLICY "Public can read partnered_companies" ON public.partnered_companies FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access partnered_companies" ON public.partnered_companies FOR ALL USING (is_admin_or_team());

-- team_tasks (admin/team read/write)
CREATE POLICY "Admins/Team can full access team_tasks" ON public.team_tasks FOR ALL USING (is_admin_or_team());

-- freelancer_applications (public insert, admin/team read/write)
CREATE POLICY "Public can insert freelancer_applications" ON public.freelancer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins/Team can full access freelancer_applications" ON public.freelancer_applications FOR ALL USING (is_admin_or_team());

-- roadmap_steps (public read, admin/team read/write)
CREATE POLICY "Public can read roadmap_steps" ON public.roadmap_steps FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access roadmap_steps" ON public.roadmap_steps FOR ALL USING (is_admin_or_team());

-- products (public read, admin/team read/write)
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins/Team can full access products" ON public.products FOR ALL USING (is_admin_or_team());

-- LMS specific policies
CREATE POLICY "Students can read lms_modules" ON public.lms_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Team can full access lms_modules" ON public.lms_modules FOR ALL USING (is_admin_or_team());

CREATE POLICY "Students can read lms_module_contents" ON public.lms_module_contents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Team can full access lms_module_contents" ON public.lms_module_contents FOR ALL USING (is_admin_or_team());

CREATE POLICY "Students can read lms_assignments" ON public.lms_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Team can full access lms_assignments" ON public.lms_assignments FOR ALL USING (is_admin_or_team());

CREATE POLICY "Students can read own lms_submissions" ON public.lms_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = lms_submissions.student_id AND auth_id = auth.uid())
);
CREATE POLICY "Students can insert own lms_submissions" ON public.lms_submissions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND auth_id = auth.uid())
);
CREATE POLICY "Admins/Team can full access lms_submissions" ON public.lms_submissions FOR ALL USING (is_admin_or_team());

CREATE POLICY "Students can read own lms_student_progress" ON public.lms_student_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM students WHERE id = lms_student_progress.student_id AND auth_id = auth.uid())
);
CREATE POLICY "Students can insert/update own lms_student_progress" ON public.lms_student_progress FOR ALL USING (
  EXISTS (SELECT 1 FROM students WHERE id = student_id AND auth_id = auth.uid())
);
CREATE POLICY "Admins/Team can full access lms_student_progress" ON public.lms_student_progress FOR ALL USING (is_admin_or_team());

CREATE POLICY "Students can read lms_announcements" ON public.lms_announcements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Team can full access lms_announcements" ON public.lms_announcements FOR ALL USING (is_admin_or_team());
