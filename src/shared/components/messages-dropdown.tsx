"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Plus } from "lucide-react";
import { useConversations } from "@/shared/hooks/useMessages";
import { Conversation } from "@/shared/utils/messages-api";
import { useCurrentUser } from "@/infrastructure/auth/auth-client";

// Helper function to format date relative to now
const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return format(dateObj, "d MMM, HH:mm", { locale: es });
};

// Helper function to get the other user in a conversation
const getOtherUser = (conversation: Conversation, currentUserId: string) => {
  return conversation.clientId === currentUserId ? conversation.professional : conversation.client;
};

export function MessagesDropdown() {
  // Fetch recent conversations (limit to 5)
  const { data, isLoading } = useConversations({ limit: 5 });
  const currentUser = useCurrentUser();
  
  const conversations = data?.conversations || [];
  // Note: unreadCount is not part of the response structure, we'll calculate it from conversations
  const unreadCount = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

  return (
    <div className="w-[380px] max-w-[calc(100vw-2rem)]">
      <div className="flex items-center justify-between p-4">
        <h4 className="text-sm font-medium">Mensajes</h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          asChild
        >
          <Link href="/messages/new">
            <Plus className="mr-2 h-3 w-3" />
            Nuevo mensaje
          </Link>
        </Button>
      </div>
      <Separator />

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div>            {conversations.map((conversation) => {
              const otherUser = currentUser ? getOtherUser(conversation, currentUser.id) : null;
              return (
              <Link 
                key={conversation.id} 
                href={`/messages/${conversation.id}`}
              >
                <div className={`p-4 hover:bg-muted transition-colors ${
                  conversation.unreadCount > 0 ? "bg-primary/5" : ""
                }`}>
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherUser?.avatar || ''} />
                      <AvatarFallback>
                        {otherUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${
                          conversation.unreadCount > 0 ? "font-medium" : ""
                        }`}>
                          {otherUser?.name}
                        </p>                        <span className="text-xs text-muted-foreground">
                          {formatDate(conversation.lastMessage?.createdAt || conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {conversation.lastMessage?.content || 'Sin mensajes'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="flex justify-end">
                          <Badge variant="default" className="text-xs">
                            {conversation.unreadCount} no {conversation.unreadCount === 1 ? 'leído' : 'leídos'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No tienes conversaciones aún
            </p>
          </div>
        )}
      </ScrollArea>

      <Separator />
      <div className="p-2">
        <Link href="/messages">
          <Button variant="outline" className="w-full text-sm h-9">
            Ver todos los mensajes
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} sin leer
              </Badge>
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
