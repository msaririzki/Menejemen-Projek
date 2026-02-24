-- ============================================
-- MANAJEMEN PROJEK - DATABASE SCHEMA
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================
-- PENTING: Jalankan RESET di bawah ini dulu jika
-- pernah menjalankan schema sebelumnya!
-- ============================================

-- RESET (uncomment jika perlu jalankan ulang)
-- DROP TABLE IF EXISTS public.tasks CASCADE;
-- DROP TABLE IF EXISTS public.project_members CASCADE;
-- DROP TABLE IF EXISTS public.projects CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;


-- =====================
-- STEP 1: BUAT SEMUA TABEL
-- =====================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. PROJECT MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, user_id)
);

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')) NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  completion_note TEXT DEFAULT '',
  position INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


-- =====================
-- STEP 2: ENABLE RLS
-- =====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;


-- =====================
-- STEP 3: SECURITY DEFINER HELPER FUNCTIONS
-- (Menghindari infinite recursion pada RLS)
-- =====================

-- Fungsi untuk mendapatkan project_ids yang user ikuti
CREATE OR REPLACE FUNCTION public.get_my_project_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
  UNION
  SELECT id FROM public.projects WHERE owner_id = auth.uid();
$$;


-- =====================
-- STEP 4: POLICIES
-- =====================

-- PROFILES POLICIES
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- PROJECTS POLICIES
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- PROJECT MEMBERS POLICIES (TANPA RECURSION!)
CREATE POLICY "members_select" ON public.project_members
  FOR SELECT TO authenticated
  USING (
    project_id IN (SELECT public.get_my_project_ids())
  );

CREATE POLICY "members_insert" ON public.project_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "members_delete" ON public.project_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
  );

-- TASKS POLICIES (TANPA RECURSION!)
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    project_id IN (SELECT public.get_my_project_ids())
  );

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (SELECT public.get_my_project_ids())
  );

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    project_id IN (SELECT public.get_my_project_ids())
  );

CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid() OR
    project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
  );


-- =====================
-- STEP 5: TRIGGER auto-create profile
-- =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================
-- STEP 6: ENABLE REALTIME
-- =====================

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- =====================
-- STEP 7: INDEXES untuk performa
-- =====================

CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_invite ON public.projects(invite_code);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
