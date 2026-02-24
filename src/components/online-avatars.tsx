"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Profile } from "@/lib/types";

interface OnlineAvatarsProps {
  members: { profile?: Profile | null }[];
}

export function OnlineAvatars({ members }: OnlineAvatarsProps) {
  const visibleMembers = members.slice(0, 5);
  const remaining = members.length - 5;

  return (
    <div className="flex items-center -space-x-2">
      {visibleMembers.map((member, i) => (
        <Tooltip key={member.profile?.id || i}>
          <TooltipTrigger asChild>
            <Avatar className="w-8 h-8 border-2 border-background ring-0 cursor-pointer hover:z-10 hover:scale-110 transition-transform">
              <AvatarImage
                src={member.profile?.avatar_url || undefined}
                alt={member.profile?.full_name || ""}
              />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-600 to-violet-600">
                {member.profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{member.profile?.full_name || member.profile?.email}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-background flex items-center justify-center text-[10px] font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
}
