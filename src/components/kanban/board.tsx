"use client";

import { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTaskForm } from "./add-task-form";
import { TaskDetailDialog } from "./task-detail-dialog";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useTaskDependencies } from "@/hooks/use-dependencies";
import { toast } from "sonner";
import type { TaskWithAssignee, TaskStatus, Profile } from "@/lib/types";
import type { TaskFilters } from "./task-filters";

interface KanbanBoardProps {
  tasks: TaskWithAssignee[];
  projectId: string;
  members: { profile?: Profile | null }[];
  isLoading: boolean;
  filters?: TaskFilters;
  currentUserId?: string;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; icon: string }[] = [
  { id: "todo", label: "Belum Dikerjakan", color: "from-zinc-500/20 to-zinc-600/20", icon: "🔲" },
  { id: "in_progress", label: "Sedang Dikerjakan", color: "from-blue-500/20 to-blue-600/20", icon: "🔄" },
  { id: "done", label: "Selesai", color: "from-emerald-500/20 to-emerald-600/20", icon: "✅" },
];

export function KanbanBoard({ tasks, projectId, members, isLoading, filters, currentUserId }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const updateTask = useUpdateTask();
  const { data: dependencies = [] } = useTaskDependencies(projectId);

  const getColumnTasks = useCallback(
    (status: TaskStatus) => {
      let filtered = tasks.filter((t) => t.status === status);

      // Apply search filter
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
        );
      }

      // Apply assignee filter
      if (filters?.assignee && filters.assignee !== "all") {
        if (filters.assignee === "unassigned") {
          filtered = filtered.filter((t) => !t.assigned_to);
        } else {
          filtered = filtered.filter((t) => t.assigned_to === filters.assignee);
        }
      }

      // Apply status filter (hide columns not matching)
      if (filters?.status && filters.status !== "all" && filters.status !== status) {
        return [];
      }

      // Sort by date (descending), then position (ascending)
      return filtered.sort((a, b) => {
        const dateA = new Date(a.updated_at).setHours(0, 0, 0, 0);
        const dateB = new Date(b.updated_at).setHours(0, 0, 0, 0);
        if (dateB !== dateA) return dateB - dateA;
        return a.position - b.position;
      });
    },
    [tasks, filters]
  );

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const newStatus = destination.droppableId as TaskStatus;
      const task = tasks.find((t) => t.id === draggableId);
      if (!task) return;

      // Check if user is trying to move someone else's task
      if (task.assigned_to && task.assigned_to !== currentUserId && newStatus !== task.status) {
        toast.error("Hanya anggota yang ditugaskan yang dapat memindahkan tugas ini.");
        return;
      }

      // Check for dependencies
      const taskDependencies = dependencies.filter(d => d.task_id === draggableId);
      const isBlocked = taskDependencies.some(d => d.blocking_task && d.blocking_task.status !== 'done');
      
      if (isBlocked && newStatus !== 'todo') {
        toast.error("Tugas diblokir! Selesaikan tugas yang menjadi syarat terlebih dahulu.");
        return;
      }

      const destTasks = getColumnTasks(newStatus).filter(
        (t) => t.id !== draggableId
      );

      let newPosition: number;
      if (destTasks.length === 0) {
        newPosition = 1000;
      } else if (destination.index === 0) {
        newPosition = (destTasks[0]?.position || 1000) - 100;
      } else if (destination.index >= destTasks.length) {
        newPosition =
          (destTasks[destTasks.length - 1]?.position || 1000) + 100;
      } else {
        const before = destTasks[destination.index - 1]?.position || 0;
        const after = destTasks[destination.index]?.position || before + 200;
        newPosition = Math.round((before + after) / 2);
      }

      try {
        await updateTask.mutateAsync({
          taskId: draggableId,
          projectId,
          updates: {
            status: newStatus,
            position: newPosition,
          },
        });
      } catch {
        // Revert akan terjadi karena invalidateQueries
      }
    },
    [tasks, getColumnTasks, projectId, updateTask]
  );

  const handleTaskClick = (task: TaskWithAssignee) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 h-full">
          {COLUMNS.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <div
                key={column.id}
                className="kanban-column glass rounded-2xl p-3 md:p-4 flex flex-col min-h-[300px]"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between mb-3 px-1`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{column.icon}</span>
                    <h3 className="font-medium text-sm">{column.label}</h3>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] rounded-lg h-5 min-w-[20px] flex items-center justify-center"
                  >
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2 rounded-xl p-1 transition-colors ${
                        snapshot.isDraggingOver
                          ? "bg-white/5 ring-1 ring-white/10"
                          : ""
                      }`}
                    >
                      {isLoading ? (
                        // Skeleton loading
                        <>
                          {[1, 2].map((i) => (
                            <div key={i} className="shimmer rounded-xl p-3 space-y-2">
                              <Skeleton className="h-4 w-3/4 bg-white/5" />
                              <Skeleton className="h-3 w-1/2 bg-white/5" />
                            </div>
                          ))}
                        </>
                      ) : (
                        (() => {
                          const items: React.ReactNode[] = [];
                          let currentGroupName = "";
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);

                          columnTasks.forEach((task, index) => {
                            const taskDate = new Date(task.updated_at);
                            taskDate.setHours(0, 0, 0, 0);

                            let groupName = "";
                            if (taskDate.getTime() === today.getTime()) {
                              groupName = "Hari ini";
                            } else if (taskDate.getTime() === yesterday.getTime()) {
                              groupName = "Kemarin";
                            } else {
                              groupName = new Date(task.updated_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              });
                            }

                            if (groupName !== currentGroupName) {
                              items.push(
                                <div key={`header-${groupName}-${column.id}`} className="mt-4 mb-2 flex items-center gap-2 px-1 first:mt-1">
                                  <div className="h-px flex-1 bg-border/40"></div>
                                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    {groupName}
                                  </span>
                                  <div className="h-px flex-1 bg-border/40"></div>
                                </div>
                              );
                              currentGroupName = groupName;
                            }

                            items.push(
                              <Draggable
                                key={task.id}
                                draggableId={task.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => handleTaskClick(task)}
                                    className={`glass rounded-xl p-3 cursor-pointer transition-all group ${
                                      snapshot.isDragging
                                        ? "shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30 rotate-2 scale-105"
                                        : "hover:border-white/15"
                                    }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                      transition: snapshot.isDragging ? undefined : 'all 0.2s ease',
                                    }}
                                  >
                                    <p className="text-sm font-medium group-hover:text-blue-400 transition-colors line-clamp-2">
                                      {task.title}
                                    </p>
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {task.description}
                                      </p>
                                    )}

                                    {/* Completion Note Preview (for done tasks) */}
                                    {task.status === "done" && task.completion_note && (
                                      <p className="text-[10px] text-emerald-400/70 mt-1.5 line-clamp-1 bg-emerald-500/10 rounded-md px-2 py-0.5">
                                        📝 {task.completion_note}
                                      </p>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/5">
                                      {/* Task Blocked Badge */}
                                      {dependencies.some(d => d.task_id === task.id && d.blocking_task && d.blocking_task.status !== 'done') && (
                                        <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10 text-[9px] px-1.5 py-0 h-4" title="Tugas ini menunggu tugas lain selesai">
                                          🔒 Blokir
                                        </Badge>
                                      )}
                                      
                                      <div className="flex-1" />
                                      {task.assignee ? (
                                        <div className="flex items-center gap-1.5">
                                          <Avatar className="w-5 h-5">
                                            <AvatarImage
                                              src={task.assignee.avatar_url || undefined}
                                            />
                                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-blue-600 to-violet-600">
                                              {task.assignee.full_name
                                                ?.charAt(0)
                                                ?.toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                            {task.assignee.full_name}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground/50">
                                          Belum ditugaskan
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          });

                          return items;
                        })()
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task (only in Todo column) */}
                {column.id === "todo" && (
                  <div className="mt-3">
                    <AddTaskForm projectId={projectId} members={members} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskDetailDialog
        task={selectedTask}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        projectId={projectId}
        members={members}
        currentUserId={currentUserId}
      />
    </>
  );
}
