"use client";

import { useActivities, useRealtimeActivities, getActionText } from "@/hooks/use-activities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityTimelineProps {
  projectId: string;
}

export function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const { data: activities = [], isLoading } = useActivities(projectId);
  useRealtimeActivities(projectId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground/60">
        Belum ada aktivitas di projek ini.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4 custom-scrollbar">
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        <AnimatePresence>
          {activities.map((activity, idx) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Icon / Avatar marker */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-black/50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 glass-solid mr-4 md:mr-0">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={activity.profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-600 to-violet-600">
                    {activity.profile?.full_name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Card content */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-xl bg-white/5 border border-white/5 shadow-sm">
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-muted-foreground/60 flex items-center justify-between">
                     <span className="font-semibold text-white/80">{activity.profile?.full_name || "User"}</span>
                     <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: idLocale })}</span>
                  </div>
                  <p className="text-sm">
                    {getActionText(activity.action, activity.target_name, activity.details)}
                  </p>
                  
                  {/* Additional details */}
                  {activity.action === "move_task" && activity.details && (
                     <div className="mt-2 text-xs flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                        <span className="opacity-50">{activity.details.from}</span>
                        <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        <span className="opacity-90 font-medium">{activity.details.to}</span>
                     </div>
                  )}
                  {activity.action === "add_comment" && activity.details?.content && (
                     <div className="mt-2 text-xs italic bg-black/20 p-2 rounded-lg border-l-2 border-l-violet-500 text-muted-foreground">
                        "{activity.details.content}"
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
