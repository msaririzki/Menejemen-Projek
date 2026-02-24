"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useRealtimeNotifications,
} from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const NOTIF_ICONS: Record<string, string> = {
  task_created: "📋",
  task_completed: "✅",
  member_joined: "👋",
  comment_added: "💬",
  task_assigned: "👤",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();

  // Subscribe real-time
  useRealtimeNotifications();

  const handleMarkAllRead = async () => {
    await markAsRead.mutateAsync(undefined);
  };

  const handleClickNotif = async (id: string) => {
    await markAsRead.mutateAsync(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative rounded-xl h-9 w-9 p-0 cursor-pointer"
        >
          <svg
            className="w-4.5 h-4.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>

          {/* Unread badge with pulse animation */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5"
              >
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="glass-solid border-white/10 rounded-2xl w-80 p-0"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="font-medium text-sm">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-[10px] h-6 rounded-lg text-blue-400 cursor-pointer"
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[350px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada notifikasi
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClickNotif(notif.id)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors flex items-start gap-3 ${
                    !notif.is_read ? "bg-blue-500/5" : ""
                  }`}
                >
                  <span className="text-sm mt-0.5 shrink-0">
                    {NOTIF_ICONS[notif.type] || "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        !notif.is_read
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
