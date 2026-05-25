import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PlusCircle, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  leading?: React.ReactNode;
}

function Header({ leading }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 md:px-6">
        {/* Leading content (sidebar trigger when authenticated) */}
        {leading}

        {/* Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            to="/"
            className="text-foreground flex items-center gap-2 text-lg font-semibold"
          >
            <Lightbulb className="size-5" />
            <span>IdeaVault</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {user && (
            <Button size="sm" asChild>
              <Link to="/ideas/new" className="flex items-center gap-2">
                <PlusCircle data-icon="inline-start" />
                <span className="hidden sm:inline">New Idea</span>
              </Link>
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
