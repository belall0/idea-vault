import { useAuth } from "@/features/auth/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="py-4 md:py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl">Your Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">
                ID
              </span>
              <span className="text-foreground font-mono text-sm">
                {user?.id}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">
                Name
              </span>
              <span className="text-foreground">{user?.name}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">
                Email
              </span>
              <span className="text-foreground">{user?.email}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">
                Role
              </span>
              <span className="text-foreground">{user?.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
