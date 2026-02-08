"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useConversations, useMessages, useSendMessage, useMarkConversationAsRead, useCreateConversation } from "@/shared/hooks/useMessages";
import { Conversation, MessageType } from "@/shared/utils/messages-api";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  ArrowLeft,
  Clock,
  XCircle,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [autoAttempted, setAutoAttempted] = useState(false);
  const searchParams = useSearchParams();

  const userRole = useUserRole();

  // Get conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations({
    page: 1,
    limit: 50,
    isActive: true,
  });

  // Get messages for selected conversation
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
  } = useMessages(selectedConversation || "", {
    page: 1,
    limit: 50,
  });

  // Mutations
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkConversationAsRead();
  const createConversationMutation = useCreateConversation();

  // Auto-open conversation when navigated with query param
  useEffect(() => {
    const professionalId = searchParams.get("conversationWith") || searchParams.get("professionalId");
    const currentUserId = userRole.user?.id;
    if (!professionalId || selectedConversation || createConversationMutation.isPending || autoAttempted) return;
    if (currentUserId && professionalId === currentUserId) {
      setAutoAttempted(true);
      return;
    }

    setAutoAttempted(true);
    createConversationMutation
      .mutateAsync(professionalId)
      .then((conversation) => {
        setSelectedConversation(conversation.id);
      })
      .catch((err) => {
        console.error("Failed to create conversation", err);
      });
  }, [searchParams, selectedConversation, createConversationMutation, autoAttempted]);

  const conversations = conversationsData?.conversations || [];
  
  // Get all messages from infinite query
  const allMessages = (messagesData?.pages?.flatMap(page => page.messages) || []).reduce<Conversation['messages']>((acc: any[], msg: any) => {
    if (!acc.find((m) => m.id === msg.id)) acc.push(msg);
    return acc;
  }, [] as any[]);
  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = userRole.isProfessional ? conversation.client : conversation.professional;
    const matchesSearch = otherUser.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterBy === "all" ||
      (filterBy === "unread" && conversation.unreadCount > 0) ||
      (filterBy === "professionals" && userRole.isClient) ||
      (filterBy === "clients" && userRole.isProfessional);

    return matchesSearch && matchesFilter;
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const currentUserId = userRole.isProfessional
      ? selectedConv?.professionalId
      : selectedConv?.clientId;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: newMessage,
        messageType: MessageType.TEXT,
        senderId: currentUserId || undefined,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark conversation as read
    const conv = conversations.find(c => c.id === conversationId);
    if (conv && conv.unreadCount > 0) {
      markAsReadMutation.mutate(conversationId);
    }
  };

  const formatMessageTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else if (diffInHours < 48) {
      return "Ayer";
    } else {
      return format(date, "dd/MM", { locale: es });
    }
  };

  const getLastMessageTime = (conversation: Conversation) => {
    if (!conversation.lastMessage) return "";
    return formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
      addSuffix: false,
      locale: es,
    });
  };

  if (conversationsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Mensajes</h1>
            <p className="text-foreground/60">
              Comunícate directamente con profesionales y clientes
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Mensajes</h1>
            <p className="text-foreground/60">
              Comunícate directamente con profesionales y clientes
            </p>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Error al cargar mensajes</h3>
              <p className="text-sm text-muted-foreground">
                Hubo un problema al cargar tus conversaciones. Por favor, intenta nuevamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mensajes</h1>
          <p className="text-foreground/60">
            Comunícate directamente con profesionales y clientes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar con lista de conversaciones */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar conversaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filter */}
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="unread">No leídas</SelectItem>                      <SelectItem value="professionals">
                        {userRole.isProfessional ? 'Clientes' : 'Profesionales'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-auto p-0">
                <div className="space-y-1">                  {filteredConversations.map((conversation) => {
                    const otherUser = userRole.isProfessional ? conversation.client : conversation.professional;
                    const isSelected = selectedConversation === conversation.id;
                    const isProfessional = userRole.isClient && 'isVerified' in conversation.professional;

                    return (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                          isSelected ? "bg-muted" : ""
                        }`}
                        onClick={() => handleSelectConversation(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={otherUser.avatar} />
                              <AvatarFallback>
                                {otherUser.name.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            {isProfessional && conversation.professional.isVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                                <CheckCheck className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {otherUser.name}
                              </h4>
                              <div className="flex items-center gap-1">
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {getLastMessageTime(conversation)}
                                </span>
                              </div>
                            </div>

                            {conversation.lastMessage && (
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredConversations.length === 0 && (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No hay conversaciones</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm
                          ? "No se encontraron conversaciones que coincidan con tu búsqueda"
                          : "Aún no tienes conversaciones"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-3">
            {selectedConv ? (
              <Card className="h-full flex flex-col">
                {/* Chat header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={userRole.isProfessional ? selectedConv.client.avatar : selectedConv.professional.avatar} 
                        />
                        <AvatarFallback>
                          {(userRole.isProfessional ? selectedConv.client.name : selectedConv.professional.name)
                            .split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">
                          {userRole.isProfessional ? selectedConv.client.name : selectedConv.professional.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {userRole.isClient && selectedConv.professional.isVerified && (
                            <>
                              <CheckCheck className="h-4 w-4 text-blue-500" />
                              <span>Verificado</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" />
                  </div>
                </CardHeader>

                <Separator />

                {/* Messages area */}
                <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : messagesError ? (
                    <div className="text-center text-muted-foreground">
                      Error al cargar mensajes
                    </div>
                  ) : allMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No hay mensajes aún
                    </div>
                  ) : (
                    <>
                      {hasNextPage && (
                        <div className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchNextPage()}
                          >
                            Cargar mensajes anteriores
                          </Button>
                        </div>
                      )}
                      
                      {allMessages.map((message) => {                        const isFromCurrentUser = message.senderId === (
                          userRole.isProfessional ? selectedConv.professionalId : selectedConv.clientId
                        );

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isFromCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isFromCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-xs opacity-70">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                                {isFromCurrentUser && message.isRead && (
                                  <CheckCheck className="h-3 w-3 opacity-70" />
                                )}
                                {isFromCurrentUser && !message.isRead && (
                                  <Clock className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </CardContent>

                <Separator />

                {/* Message input */}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />

                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Selecciona una conversación
                  </h3>
                  <p className="text-muted-foreground">
                    Elige una conversación de la lista para comenzar a chatear
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
