-- ============================================
-- FITUR BARU: Comments, Notifications, Completed_by
-- Jalankan SQL ini di Supabase SQL Editor
-- SETELAH schema.sql utama sudah dijalankan
-- ============================================

-- 1. Tambah kolom completed_by di tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. TASK COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Comments bisa dilihat oleh anggota projek
CREATE POLICY "comments_select" ON public.task_comments
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT id FROM public.tasks WHERE project_id IN (SELECT public.get_my_project_ids())
    )
  );

CREATE POLICY "comments_insert" ON public.task_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "comments_delete" ON public.task_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_created', 'task_completed', 'member_joined', 'comment_added', 'task_assigned')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 4. ENABLE REALTIME untuk tabel baru
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.task_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);
