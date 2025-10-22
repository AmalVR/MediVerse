import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface MentorCardProps {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  status: "online" | "busy" | "away";
  currentStudents: number;
  maxStudents: number;
  sessionTitle?: string;
  onClick?: () => void;
  className?: string;
}

export function MentorCard({
  id,
  name,
  avatar,
  specialty,
  status,
  currentStudents,
  maxStudents,
  sessionTitle,
  onClick,
  className = "",
}: MentorCardProps) {
  const statusColors = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    away: "bg-gray-400",
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        status === "online" ? "ring-2 ring-green-500/20" : ""
      } ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${statusColors[status]}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{name}</h3>
            <p className="text-xs text-muted-foreground">{specialty}</p>
            <div className="flex items-center gap-2 mt-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {currentStudents}/{maxStudents}
              </span>
            </div>
            {sessionTitle && (
              <p className="text-xs text-primary mt-1 truncate">
                {sessionTitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
