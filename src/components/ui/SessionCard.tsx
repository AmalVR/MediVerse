import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface SessionCardProps {
  id: string;
  title: string;
  code: string;
  studentCount: number;
  isLive?: boolean;
  onJoin?: () => void;
  className?: string;
}

export function SessionCard({
  id,
  title,
  code,
  studentCount,
  isLive = false,
  onJoin,
  className = "",
}: SessionCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Session Code: {code}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{studentCount} students</span>
          </div>
          <Badge variant="outline">{code}</Badge>
        </div>
        {onJoin && (
          <Button size="sm" className="w-full" onClick={onJoin}>
            Join Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
