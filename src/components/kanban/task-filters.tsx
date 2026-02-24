"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile, TaskStatus } from "@/lib/types";

export interface TaskFilters {
  search: string;
  assignee: string;
  status: string;
}

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  members: { profile?: Profile | null }[];
}

export function TaskFiltersBar({
  filters,
  onFiltersChange,
  members,
}: TaskFiltersBarProps) {
  const hasActiveFilters =
    filters.search || filters.assignee !== "all" || filters.status !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <Input
          placeholder="Cari tugas..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-9 h-9 bg-white/5 border-white/10 rounded-xl text-sm"
        />
      </div>

      {/* Filter by Assignee */}
      <Select
        value={filters.assignee}
        onValueChange={(v) => onFiltersChange({ ...filters, assignee: v })}
      >
        <SelectTrigger className="w-[160px] h-9 bg-white/5 border-white/10 rounded-xl text-xs">
          <SelectValue placeholder="Semua anggota" />
        </SelectTrigger>
        <SelectContent className="glass-solid border-white/10 rounded-xl">
          <SelectItem value="all">Semua anggota</SelectItem>
          <SelectItem value="unassigned">Belum ditugaskan</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.profile?.id} value={m.profile?.id || ""}>
              <div className="flex items-center gap-2">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={m.profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-[6px] bg-gradient-to-br from-blue-600 to-violet-600">
                    {m.profile?.full_name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {m.profile?.full_name || m.profile?.email}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter by Status */}
      <Select
        value={filters.status}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[160px] h-9 bg-white/5 border-white/10 rounded-xl text-xs">
          <SelectValue placeholder="Semua status" />
        </SelectTrigger>
        <SelectContent className="glass-solid border-white/10 rounded-xl">
          <SelectItem value="all">Semua status</SelectItem>
          <SelectItem value="todo">🔲 Belum Dikerjakan</SelectItem>
          <SelectItem value="in_progress">🔄 Sedang Dikerjakan</SelectItem>
          <SelectItem value="done">✅ Selesai</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFiltersChange({ search: "", assignee: "all", status: "all" })
          }
          className="h-9 rounded-xl text-xs text-muted-foreground cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Reset
        </Button>
      )}
    </div>
  );
}
