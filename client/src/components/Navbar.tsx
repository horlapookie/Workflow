import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Gem, LayoutDashboard, Plus, Shield, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  userEmail?: string;
  sapphireBalance?: number;
  onLogout?: () => void;
}

export default function Navbar({
  isAuthenticated = false,
  isAdmin = false,
  userEmail = "user@example.com",
  sapphireBalance = 0,
  onLogout = () => console.log("Logout triggered"),
}: NavbarProps) {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="w-8 h-8 bg-sapphire rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">HP</span>
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">HP Hosting</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              data-testid="link-dashboard"
              className={`text-sm font-medium transition-colors hover-elevate px-3 py-2 rounded-md ${
                location === "/dashboard" ? "text-sapphire" : "text-sidebar-foreground"
              }`}
            >
              <LayoutDashboard className="inline-block w-4 h-4 mr-1" />
              Dashboard
            </Link>
            <Link
              href="/claim-sapphire"
              data-testid="link-claim-sapphire"
              className={`text-sm font-medium transition-colors hover-elevate px-3 py-2 rounded-md ${
                location === "/claim-sapphire" ? "text-sapphire" : "text-sidebar-foreground"
              }`}
            >
              <Gem className="inline-block w-4 h-4 mr-1" />
              Claim Sapphire
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                data-testid="link-admin"
                className={`text-sm font-medium transition-colors hover-elevate px-3 py-2 rounded-md ${
                  location === "/admin" ? "text-sapphire" : "text-sidebar-foreground"
                }`}
              >
                <Shield className="inline-block w-4 h-4 mr-1" />
                Admin
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-user-menu">
                  <div className="w-8 h-8 rounded-full bg-sapphire/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-sapphire">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userEmail}</span>
                    <span className="text-xs text-muted-foreground">User Account</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login" className="text-sidebar-foreground">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="default" data-testid="button-signup">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
