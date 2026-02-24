export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
};

export type ProjectWithDetails = Project & {
  owner: Profile;
  member_count: number;
  task_stats: {
    total: number;
    done: number;
  };
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  profile?: Profile;
};

export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigned_to: string | null;
  created_by: string;
  completed_by: string | null;
  completion_note: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TaskWithAssignee = Task & {
  assignee?: Profile | null;
  creator?: Profile | null;
  completer?: Profile | null;
};

export type TaskComment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile | null;
};

export type Notification = {
  id: string;
  user_id: string;
  project_id: string | null;
  type: 'task_created' | 'task_completed' | 'member_joined' | 'comment_added' | 'task_assigned';
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, string> | null;
  created_at: string;
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Belum Dikerjakan",
  in_progress: "Sedang Dikerjakan",
  done: "Selesai",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};
