-- Buat tabel task_dependencies
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(task_id, depends_on_task_id) -- Mencegah duplikasi dependensi
);

-- Enable RLS
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- Kebijakan Select
CREATE POLICY "Anggota bisa melihat dependensi"
ON public.task_dependencies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = task_dependencies.project_id
    AND user_id = auth.uid()
  )
);

-- Kebijakan Insert, Update, Delete
CREATE POLICY "Anggota bisa mengatur dependensi"
ON public.task_dependencies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = task_dependencies.project_id
    AND user_id = auth.uid()
  )
);
