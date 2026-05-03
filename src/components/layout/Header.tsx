import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PlusCircle, Lightbulb } from "lucide-react";

function Header() {
  return (
    <header className="border-border bg-background border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="text-foreground flex items-center gap-2 text-lg font-semibold"
          >
            <Lightbulb className="h-5 w-5" />
            <span>IdeaDrop</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/ideas">Ideas</Link>
          </Button>

          <Button asChild>
            <Link to="/ideas/new" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Idea</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
