"use client";

import { useState } from "react";

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
  Search,  Star,
  Send,
  Phone,
  VideoIcon,
  MoreHorizontal,
  Paperclip,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";

// Mock data para conversaciones
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    user: {
      name: "Carlos Méndez",
      avatar: "/avatars/carlos.jpg",
      isOnline: true,
      isProfessional: true,
      rating: 4.9,
    },
    lastMessage: {
      text: "Perfecto, estaré allá mañana a las 2 PM",
      time: "2 min",
      isRead: true,
      fromMe: false,
    },
    unreadCount: 0,
    service: "Reparación de Electrodomésticos",
  },
  {
    id: 2,
    user: {
      name: "Ana García",
      avatar: "/avatars/ana.jpg",
      isOnline: false,
      isProfessional: false,
      lastSeen: "Hace 1 hora",
    },
    lastMessage: {
      text: "¿Podrías pasarme un presupuesto para la instalación?",
      time: "1h",
      isRead: false,
      fromMe: false,
    },
    unreadCount: 2,
    service: "Instalación Eléctrica",
  },
  {
    id: 3,
    user: {
      name: "Roberto Silva",
      avatar: "/avatars/roberto.jpg",
      isOnline: true,
      isProfessional: false,
    },
    lastMessage: {
      text: "Gracias por el excelente servicio",
      time: "3h",
      isRead: true,
      fromMe: false,
    },
    unreadCount: 0,
    service: "Reparación de Computadores",
  },
];

// Mock data para mensajes de una conversación
const MOCK_MESSAGES = [
  {
    id: 1,
    text: "Hola, vi tu perfil y me interesa el servicio de reparación de electrodomésticos",
    time: "10:30 AM",
    fromMe: true,
    isRead: true,
  },
  {
    id: 2,
    text: "¡Hola! Claro, con gusto te ayudo. ¿Qué electrodoméstico necesitas reparar?",
    time: "10:32 AM",
    fromMe: false,
    isRead: true,
  },
  {
    id: 3,
    text: "Es mi lavadora, no está centrifugando bien y hace ruidos extraños",
    time: "10:35 AM",
    fromMe: true,
    isRead: true,
  },
  {
    id: 4,
    text: "Entiendo. Por la descripción podrían ser los rodamientos o la banda. ¿Qué marca y modelo es?",
    time: "10:37 AM",
    fromMe: false,
    isRead: true,
  },
  {
    id: 5,
    text: "Es una LG de carga superior, modelo WT1101CW, tiene como 3 años",
    time: "10:40 AM",
    fromMe: true,
    isRead: true,
  },
  {
    id: 6,
    text: "Perfecto, conozco bien ese modelo. El diagnóstico tiene un costo de $50.000 y si decides reparar, se descuenta del valor total. ¿Te parece bien si voy mañana en la tarde?",
    time: "10:42 AM",
    fromMe: false,
    isRead: true,
  },
  {
    id: 7,
    text: "Perfecto, estaré allá mañana a las 2 PM",
    time: "10:45 AM",
    fromMe: false,
    isRead: true,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const filteredConversations = MOCK_CONVERSATIONS.filter((conversation) => {
    const matchesSearch = conversation.user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterBy === "all" ||
      (filterBy === "unread" && conversation.unreadCount > 0) ||
      (filterBy === "professionals" && conversation.user.isProfessional) ||
      (filterBy === "clients" && !conversation.user.isProfessional);

    return matchesSearch && matchesFilter;
  });

  const selectedConv = MOCK_CONVERSATIONS.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aquí enviaríamos el mensaje
      console.log("Enviando mensaje:", newMessage);
      setNewMessage("");
    }
  };

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
                      <SelectItem value="unread">No leídas</SelectItem>
                      <SelectItem value="professionals">Profesionales</SelectItem>
                      <SelectItem value="clients">Clientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto px-0">
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                        selectedConversation === conversation.id
                          ? "bg-muted border-l-primary"
                          : "border-l-transparent"
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.user.avatar} />
                            <AvatarFallback>
                              {conversation.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {conversation.user.name}
                              </span>
                              {conversation.user.isProfessional && (
                                <Badge variant="outline" className="text-xs">
                                  Pro
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-foreground/60">
                                {conversation.lastMessage.time}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge className="h-4 w-4 p-0 text-xs flex items-center justify-center">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-foreground/70 truncate mb-1">
                            {conversation.lastMessage.text}
                          </p>

                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {conversation.service}
                            </Badge>
                            {conversation.user.isProfessional && conversation.user.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{conversation.user.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedConv ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
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
                      </Button>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConv.user.avatar} />
                        <AvatarFallback>
                          {selectedConv.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{selectedConv.user.name}</h3>
                          {selectedConv.user.isProfessional && (
                            <Badge variant="outline" className="text-xs">
                              Profesional
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                          {selectedConv.user.isOnline ? (
                            <>
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <span>En línea</span>
                            </>
                          ) : (
                            <span>{selectedConv.user.lastSeen || "Desconectado"}</span>
                          )}
                          <span>•</span>
                          <span>{selectedConv.service}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <VideoIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {MOCK_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.fromMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                            message.fromMe ? "text-primary-foreground/70" : "text-foreground/60"
                          }`}>
                            <span>{message.time}</span>
                            {message.fromMe && (
                              <CheckCheck className={`h-3 w-3 ${
                                message.isRead ? "text-blue-300" : "text-primary-foreground/50"
                              }`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <Separator />

                {/* Message Input */}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Selecciona una conversación
                  </h3>
                  <p className="text-foreground/60">
                    Elige una conversación de la lista para comenzar a chatear
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
