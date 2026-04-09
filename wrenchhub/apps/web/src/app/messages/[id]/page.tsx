"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface MessageItem {
  id: string;
  text: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface ConversationDetail {
  id: string;
  job: { id: string; title: string } | null;
  participants: Array<{
    user: { id: string; name: string; role: string };
  }>;
}

export default function ConversationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiFetch<ConversationDetail[]>("/api/conversations"),
  });

  const conversation = conversations.find((c) => c.id === id);
  const otherUser = conversation?.participants.find((p) => p.user.id !== user?.id)?.user;

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => apiFetch<MessageItem[]>(`/api/conversations/${id}/messages`),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const sendMessage = useMutation({
    mutationFn: (text: string) =>
      apiFetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setText("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage.mutate(text.trim());
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  };

  // Group messages by date
  let lastDate = "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center gap-4">
        <button onClick={() => router.push("/messages")} className="text-gray-500 hover:text-gray-700">
          &larr;
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold text-sm">
          {otherUser?.name?.charAt(0) || "?"}
        </div>
        <div>
          <div className="font-semibold text-sm">{otherUser?.name || "Loading..."}</div>
          {conversation?.job && (
            <div className="text-xs text-gray-400">Re: {conversation.job.title}</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender.id === user?.id;
          const msgDate = formatDate(msg.createdAt);
          let showDate = false;
          if (msgDate !== lastDate) {
            showDate = true;
            lastDate = msgDate;
          }

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center text-xs text-gray-400 my-4">{msgDate}</div>
              )}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${isMe ? "order-last" : ""}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-brand-orange text-white rounded-br-sm"
                        : "bg-white border rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${isMe ? "text-right" : ""}`}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t px-6 py-3 flex gap-3 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
          autoFocus
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMessage.isPending}
          className="bg-brand-orange text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
        >
          &#10148;
        </button>
      </form>
    </div>
  );
}
