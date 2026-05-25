import { Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";

import { Button } from "@/shared/ui/button";

export default function GuestHeader() {
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            to="/"
            className="text-foreground group flex items-center gap-2.5 text-lg font-semibold"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-all duration-300 group-hover:scale-105 dark:bg-amber-500/20">
              <Lightbulb className="size-4.5" />
            </div>
            <span>IdeaVault</span>
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
