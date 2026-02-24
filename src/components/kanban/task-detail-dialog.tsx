"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUpdateTask, useDeleteTask, useTasks } from "@/hooks/use-tasks";
import { useComments, useAddComment, useRealtimeComments } from "@/hooks/use-comments";
import { useTaskDependencies, useRealtimeDependencies, useAddDependency, useRemoveDependency } from "@/hooks/use-dependencies";
import type { TaskWithAssignee, TaskStatus, Profile } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface TaskDetailDialogProps {
  task: TaskWithAssignee | null;
  open: boolean;
  onClose: () => void;
  projectId: string;
  members: { profile?: Profile | null }[];
  currentUserId?: string;
}

export function TaskDetailDialog({
  task,
  open,
  onClose,
  projectId,
  members,
  currentUserId,
}: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [completionNote, setCompletionNote] = useState("");
  const [comment, setComment] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addComment = useAddComment();

  const { data: comments = [] } = useComments(task?.id || "");
  useRealtimeComments(task?.id || "");

  // Fetch all tasks for dependency dropdown
  const { data: allTasks = [] } = useTasks(projectId);
  const { data: dependencies = [] } = useTaskDependencies(projectId);
  useRealtimeDependencies(projectId);

  const addDependency = useAddDependency();
  const removeDependency = useRemoveDependency();

  // Filter dependencies for this task
  const myDependencies = dependencies.filter(d => d.task_id === task?.id);
  
  // Available tasks to depend on
  const availableTasksToDependOn = allTasks.filter(t => 
    t.id !== task?.id && 
    !myDependencies.some(d => d.depends_on_task_id === t.id)
  );

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  const handleOpen = () => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setAssignedTo(task.assigned_to || "");
      setCompletionNote(task.completion_note || "");
      setIsEditing(false);
      setComment("");
    }
  };

  const handleSave = async () => {
    if (!task) return;
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        projectId,
        updates: {
          title,
          description,
          status,
          assigned_to: assignedTo || null,
          completion_note: completionNote,
        },
      });
      toast.success("Tugas berhasil diperbarui");
      setIsEditing(false);
    } catch {
      toast.error("Gagal memperbarui tugas");
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask.mutateAsync({ taskId: task.id, projectId });
      toast.success("Tugas berhasil dihapus");
      onClose();
    } catch {
      toast.error("Gagal menghapus tugas");
    }
  };

  const handleAddComment = async () => {
    if (!task || !comment.trim()) return;
    try {
      await addComment.mutateAsync({
        taskId: task.id,
        content: comment.trim(),
        projectId,
      });
      setComment("");
    } catch {
      toast.error("Gagal mengirim komentar");
    }
  };

  if (!task) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) handleOpen();
        else onClose();
      }}
    >
      <DialogContent className="glass-solid sm:max-w-lg border-white/10 rounded-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {isEditing ? "Edit Tugas" : "Detail Tugas"}
            </DialogTitle>
            <Badge className={`${STATUS_COLORS[task.status]} text-[10px] rounded-lg`}>
              {STATUS_LABELS[task.status]}
            </Badge>
          </div>
          <DialogDescription className="sr-only">
            Detail tugas {task.title}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 py-2" onFocus={() => !isEditing && setIsEditing(true)}>
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Judul</Label>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl"
                />
              ) : (
                <p className="font-medium cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setIsEditing(true)}>
                  {task.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 w-full">
              <Label className="text-xs text-muted-foreground block mb-2">Deskripsi</Label>
              {isEditing ? (
                <MarkdownEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Tambahkan deskripsi..."
                  minHeight="min-h-[150px]"
                />
              ) : (
                <div onClick={() => setIsEditing(true)} className="cursor-pointer bg-black/10 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <MarkdownViewer content={task.description} />
                </div>
              )}
            </div>

            {/* Status */}
            {isEditing && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(v) => setStatus(v as TaskStatus)}
                  disabled={task.assigned_to !== null && task.assigned_to !== currentUserId}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-solid border-white/10 rounded-xl">
                    <SelectItem value="todo">🔲 Belum Dikerjakan</SelectItem>
                    <SelectItem value="in_progress">🔄 Sedang Dikerjakan</SelectItem>
                    <SelectItem value="done">✅ Selesai</SelectItem>
                  </SelectContent>
                </Select>
                {task.assigned_to && task.assigned_to !== currentUserId && (
                  <p className="text-[10px] text-amber-500/80 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Hanya pengguna yang ditugaskan yang dapat mengubah status.
                  </p>
                )}
              </div>
            )}

            {/* Assign to */}
            {isEditing && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Ditugaskan ke</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Pilih anggota..." />
                  </SelectTrigger>
                  <SelectContent className="glass-solid border-white/10 rounded-xl">
                    <SelectItem value="unassigned">Belum ditugaskan</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.profile?.id} value={m.profile?.id || ""}>
                        {m.profile?.full_name || m.profile?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Task Dependencies */}
            {isEditing && (
              <div className="space-y-1.5 overflow-hidden">
                <Label className="text-xs text-muted-foreground">Menunggu Tugas (Blokir)</Label>
                
                {myDependencies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {myDependencies.map(dep => (
                      <Badge key={dep.id} variant="secondary" className="flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 max-w-full">
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="truncate max-w-[150px]" title={dep.blocking_task?.title}>{dep.blocking_task?.title}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 ml-1 rounded-full hover:bg-red-500/20 shrink-0"
                          onClick={() => removeDependency.mutate({ id: dep.id, projectId })}
                          disabled={removeDependency.isPending}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <Select
                  onValueChange={(val) => {
                    if (task && val && val !== "none") {
                      addDependency.mutate({
                        projectId,
                        taskId: task.id,
                        dependsOnTaskId: val
                      });
                    }
                  }}
                  value=""
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue placeholder="Tambahkan tugas yang memblokir..." />
                  </SelectTrigger>
                  <SelectContent className="glass-solid border-white/10 rounded-xl max-w-[300px]">
                    {availableTasksToDependOn.length === 0 ? (
                      <SelectItem value="none" disabled>Tidak ada tugas lain</SelectItem>
                    ) : (
                      availableTasksToDependOn.map(t => (
                        <SelectItem key={t.id} value={t.id} className="truncate">{t.title}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* View Mode Dependencies */}
            {!isEditing && myDependencies.length > 0 && (
              <div className="space-y-1.5 overflow-hidden">
                <Label className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Diblokir oleh:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {myDependencies.map(dep => (
                    <Badge key={dep.id} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 cursor-help max-w-full" title={dep.blocking_task?.status === 'done' ? 'Tugas Selesai' : 'Tugas Belum Selesai'}>
                      <span className="truncate max-w-[200px]">{dep.blocking_task?.title}</span>
                      {dep.blocking_task?.status === 'done' && <span className="ml-1 text-emerald-400 shrink-0">✅</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Note - only show when status is "done" */}
            {(status === "done" || task.status === "done") && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">📝 Keterangan Penyelesaian</Label>
                {isEditing ? (
                  <Textarea
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl resize-none"
                    rows={2}
                    placeholder="Jelaskan apa yang sudah dikerjakan..."
                  />
                ) : (
                  <p className="text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    {task.completion_note || "Tidak ada keterangan"}
                  </p>
                )}
              </div>
            )}

            <Separator className="bg-white/5" />

            {/* Info Anggota Section */}
            <div className="space-y-2.5">
              <Label className="text-xs text-muted-foreground font-medium">👥 Info Anggota</Label>
              <div className="grid grid-cols-1 gap-2">
                {/* Pembuat */}
                <div className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-muted-foreground/60 w-20 shrink-0">Dibuat oleh</span>
                  {task.creator ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={task.creator.avatar_url || undefined} />
                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-blue-600 to-violet-600">
                          {task.creator.full_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{task.creator.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unknown</span>
                  )}
                </div>

                {/* Pengerjaan */}
                <div className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-muted-foreground/60 w-20 shrink-0">Dikerjakan</span>
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={task.assignee.avatar_url || undefined} />
                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-blue-600 to-violet-600">
                          {task.assignee.full_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{task.assignee.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Belum ditugaskan</span>
                  )}
                </div>

                {/* Penyelesai */}
                {task.status === "done" && (
                  <div className="flex items-center gap-2 bg-emerald-500/5 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-emerald-400/60 w-20 shrink-0">Diselesaikan</span>
                    {task.completer ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={task.completer.avatar_url || undefined} />
                          <AvatarFallback className="text-[8px] bg-gradient-to-br from-emerald-600 to-teal-600">
                            {task.completer.full_name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-emerald-400">{task.completer.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <p className="text-[10px] text-muted-foreground/40 px-1">
                Dibuat {formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: idLocale })}
              </p>
            </div>

            <Separator className="bg-white/5" />

            {/* Komentar Section */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground font-medium">
                💬 Komentar ({comments.length})
              </Label>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-2.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                        <AvatarImage src={c.profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-blue-600 to-violet-600">
                          {c.profile?.full_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">
                            {c.profile?.full_name || "User"}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50">
                            {formatDistanceToNow(new Date(c.created_at), {
                              addSuffix: true,
                              locale: idLocale,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 break-words">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/50 text-center py-3">
                  Belum ada komentar
                </p>
              )}

              {/* Comment Input */}
              <div className="flex items-center gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="bg-white/5 border-white/10 rounded-xl h-9 text-sm flex-1"
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!comment.trim() || addComment.isPending}
                  className="h-9 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-3 cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {isEditing && (
            <>
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl cursor-pointer"
                disabled={deleteTask.isPending}
              >
                Hapus
              </Button>
              <div className="flex-1" />
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  handleOpen();
                }}
                className="rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 cursor-pointer"
                disabled={updateTask.isPending}
              >
                Simpan
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
