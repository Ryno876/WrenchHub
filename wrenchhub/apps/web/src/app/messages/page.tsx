"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface ConversationListItem {
  id: string;
  jobId: string | null;
  job: { id: string; title: string } | null;
  participants: Array<{
    user: { id: string; name: string; role: string };
  }>;
  messages: Array<{
    text: string;
    createdAt: string;
    senderId: string;
  }>;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiFetch<ConversationListItem[]>("/api/conversations"),
  });

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {isLoading ? (
          <p className="text-gray-500">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">
            <p className="text-lg mb-1">No messages yet</p>
            <p className="text-sm">Start a conversation from a job posting or mechanic profile.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const otherUser = conv.participants.find((p) => p.user.id !== user?.id)?.user;
              const lastMessage = conv.messages[0];

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className={`block bg-white rounded-xl border p-4 hover:shadow-md transition ${
                    conv.unreadCount > 0 ? "border-l-4 border-l-brand-orange" : ""
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {otherUser?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">
                          {otherUser?.name || "Unknown"}
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 bg-brand-orange text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </span>
                        {lastMessage && (
                          <span className="text-xs text-gray-400">{timeAgo(lastMessage.createdAt)}</span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-sm text-gray-500 truncate">{lastMessage.text}</p>
                      )}
                      {conv.job && (
                        <p className="text-xs text-gray-400 mt-1">Re: {conv.job.title}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
