"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserRole } from "@/infrastructure/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";

export function GlobalNavbar() {
  const { user, isAuthenticated } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-4">
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
