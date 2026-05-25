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
            className="text-foreground flex items-center gap-2 text-lg font-semibold"
          >
            <Lightbulb className="size-5" />
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
