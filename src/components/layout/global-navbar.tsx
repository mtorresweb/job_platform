"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, X, MessageCircle, Bell, Calendar, Settings, User, LogOut, Activity, Briefcase, BarChart, HelpCircle } from "lucide-react";
import { useUnreadNotificationCount, useNotificationListener } from "@/shared/hooks/useNotifications";
import { useUnreadCount } from "@/shared/hooks/useMessages";
import { NotificationsDropdown } from "@/shared/components/notifications-dropdown";
import { MessagesDropdown } from "@/shared/components/messages-dropdown";

export function GlobalNavbar() {
  const { user, isAuthenticated, isProfessional } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);  const { data: unreadNotificationCount = 0 } = useUnreadNotificationCount();
  const { data: unreadMessagesData } = useUnreadCount();
  const unreadMessageCount = typeof unreadMessagesData === 'object' && unreadMessagesData !== null && 'total' in unreadMessagesData 
    ? unreadMessagesData.total 
    : 0;
  
  // Initialize notification listener for real-time updates
  useNotificationListener();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">
                  SP
                </span>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ServiciosPro
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/services"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Servicios
            </Link>
            <Link
              href="/professionals"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Profesionales
            </Link>
            <Link
              href="/how-it-works"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Cómo funciona
            </Link>
            <Link
              href="/about"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Nosotros
            </Link>
          </nav>          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Navigation Icons for Authenticated Users */}
                <div className="hidden md:flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">                      <MessageCircle className="h-5 w-5" />
                        {unreadMessageCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                          >
                            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="p-0" align="end">
                      <MessagesDropdown />
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadNotificationCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                          >
                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="p-0" align="end">
                      <NotificationsDropdown />
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Link href="/bookings">
                    <Button variant="ghost" size="sm">
                      <Calendar className="h-5 w-5" />
                    </Button>
                  </Link>                  
                  
                  {isProfessional && (
                    <Link href="/jobs">
                      <Button variant="ghost" size="sm">
                        <Briefcase className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>                <div className="hidden sm:flex items-center space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user?.name}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>                      <DropdownMenuItem asChild>
                        <Link href="/activity" className="cursor-pointer">
                          <Activity className="mr-2 h-4 w-4" />
                          Actividad
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/analytics" className="cursor-pointer">
                          <BarChart className="mr-2 h-4 w-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Configuración
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/support" className="cursor-pointer">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Soporte
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span className="text-sm font-medium">
                    Hola, {user?.name}
                  </span>
                </div>
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="hidden sm:inline-flex"
                >
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Comenzar</Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-4">
              {isAuthenticated && (
                <>
                  {/* Mobile Navigation for Authenticated Users */}
                  <div className="flex items-center justify-around pb-4 border-b">
                    <Link
                      href="/messages"
                      className="flex flex-col items-center space-y-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="relative">                        <MessageCircle className="h-6 w-6 text-foreground/70" />
                        {unreadMessageCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                          >
                            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-foreground/70">Mensajes</span>
                    </Link>
                    <Link
                      href="/notifications"
                      className="flex flex-col items-center space-y-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >                      <div className="relative">
                        <Bell className="h-6 w-6 text-foreground/70" />
                        {unreadNotificationCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                          >
                            {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-foreground/70">Notificaciones</span>
                    </Link>                    <Link
                      href="/bookings"
                      className="flex flex-col items-center space-y-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="h-6 w-6 text-foreground/70" />
                      <span className="text-xs text-foreground/70">Reservas</span>
                    </Link>                    {isProfessional && (
                      <Link
                        href="/jobs"
                        className="flex flex-col items-center space-y-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="h-6 w-6 text-foreground/70" />
                        <span className="text-xs text-foreground/70">Trabajos</span>
                      </Link>
                    )}<Link
                      href="/dashboard"
                      className="flex flex-col items-center space-y-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-6 w-6 text-foreground/70" />
                      <span className="text-xs text-foreground/70">Dashboard</span>
                    </Link>                    <Link
                      href="/activity"
                      className="flex flex-col items-center space-y-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Activity className="h-6 w-6 text-foreground/70" />
                      <span className="text-xs text-foreground/70">Actividad</span>
                    </Link>
                    <Link
                      href="/analytics"
                      className="flex flex-col items-center space-y-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart className="h-6 w-6 text-foreground/70" />
                      <span className="text-xs text-foreground/70">Analytics</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex flex-col items-center space-y-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-6 w-6 text-foreground/70" />
                      <span className="text-xs text-foreground/70">Configuración</span>
                    </Link>
                  </div>
                </>
              )}
              
              <Link
                href="/services"
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicios
              </Link>
              <Link
                href="/professionals"
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profesionales
              </Link>
              <Link
                href="/how-it-works"
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cómo funciona
              </Link>
              <Link
                href="/about"
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/auth/login"
                  className="text-foreground/70 hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
