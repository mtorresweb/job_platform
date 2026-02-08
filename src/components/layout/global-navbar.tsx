"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
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
import { Menu, X, MessageCircle, Bell, User, LogOut, Activity, Calendar, Briefcase, Settings, BarChart, Users } from "lucide-react";
import { 
  useUnreadNotificationCount, 
  useNotificationListener, 
} from "@/shared/hooks/useNotifications";
import { useUnreadCount } from "@/shared/hooks/useMessages";

export function GlobalNavbar() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const isProfessional = user?.role === "PROFESSIONAL";
  const { data: currentUser } = useCurrentUser({ enabled: isAuthenticated });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadNotificationCount = 0 } = useUnreadNotificationCount();
  const { data: unreadMessagesData } = useUnreadCount();
  
  const unreadMessageCount = typeof unreadMessagesData === 'object' && unreadMessagesData !== null && 'total' in unreadMessagesData 
    ? unreadMessagesData.total 
    : 0;
  
  // Initialize notification listener for real-time updates
  useNotificationListener();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">
                  RP
                </span>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Red Profesional
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Nosotros
            </Link>
            <Link
              href="/how-it-works"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Cómo funciona
            </Link>
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
          </nav>

          <div className="flex items-center space-x-4">
            {mounted && (
              isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Notificaciones: ir directo a la página */}
                  <div className="hidden md:block">
                    <Button asChild variant="ghost" size="icon" className="relative cursor-pointer">
                      <Link href="/notifications" aria-label="Ver notificaciones">
                        <Bell className="h-5 w-5" />
                        {unreadNotificationCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                          >
                            {unreadNotificationCount}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  </div>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                        <Avatar className="h-10 w-10 cursor-pointer">
                          <AvatarImage
                            key={currentUser?.avatar || user?.avatar || "fallback-avatar"}
                            src={currentUser?.avatar || user?.avatar || ""}
                          />
                          <AvatarFallback>
                            {currentUser?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Show combined badge only on mobile */}
                        {(unreadMessageCount > 0 || unreadNotificationCount > 0) && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs md:hidden"
                          >
                            {unreadMessageCount + unreadNotificationCount}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          key={currentUser?.avatar || user?.avatar || "fallback-avatar"}
                          src={currentUser?.avatar || user?.avatar || ""}
                        />
                        <AvatarFallback>{currentUser?.name?.charAt(0) || user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{currentUser?.name || user?.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {currentUser?.email || user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Reservas
                      </Link>
                    </DropdownMenuItem>
                    {/* Notifications in dropdown only for mobile */}
                    <div className="md:hidden">
                      <DropdownMenuItem asChild>
                        <Link href="/notifications" className="cursor-pointer flex justify-between items-center">
                          <span className="flex items-center">
                            <Bell className="mr-2 h-4 w-4" />
                            Notificaciones
                          </span>
                          {unreadNotificationCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadNotificationCount}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    {(currentUser?.role === 'ADMIN' || currentUser?.role === 'PROFESSIONAL') && (
                      <DropdownMenuItem asChild>
                        <Link href="/activity" className="cursor-pointer">
                          <Activity className="mr-2 h-4 w-4" />
                          Actividad
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {currentUser?.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users" className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          Administrar usuarios
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="cursor-pointer flex justify-between items-center">
                        <span className="flex items-center">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Mensajes
                        </span>
                        {unreadMessageCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {unreadMessageCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        signOut();
                      }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Salir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            ))}

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
        </div>
        
        {/* Mobile Menu */}
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
                href="/about"
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/how-it-works"
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cómo funciona
              </Link>
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
