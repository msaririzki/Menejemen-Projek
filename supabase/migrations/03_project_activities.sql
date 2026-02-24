-- Buat tabel project_activities
CREATE TABLE IF NOT EXISTS public.project_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- contoh: 'create_task', 'update_task', 'move_task', 'delete_task', 'add_comment'
  target_id UUID, -- ID dari item yang dimodifikasi (bisa task_id)
  target_name TEXT, -- Nama atau judul dari item yang dimodifikasi (untuk referensi jika di-delete)
  details JSONB, -- Objek berisi detail spesifik dari aksi (contoh: { from: 'todo', to: 'done' })
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Pengguna bisa melihat aktivitas jika mereka adalah anggota dari projek tersebut
CREATE POLICY "Anggota bisa melihat aktivitas projek"
ON public.project_activities
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = project_activities.project_id
    AND user_id = auth.uid()
  )
);

-- Kebijakan: Pengguna bisa menambah aktivitas jika mereka adalah anggota dari projek tersebut
CREATE POLICY "Anggota bisa menambah aktivitas"
ON public.project_activities
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = project_activities.project_id
    AND user_id = auth.uid()
  )
);

-- Bikin indeks untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON public.project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON public.project_activities(created_at DESC);
