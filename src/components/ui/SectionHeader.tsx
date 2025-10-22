import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  iconColor = "",
  badge,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-2xl font-bold flex items-center gap-2">
        {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
        {title}
      </h2>
      {badge && (
        <Badge variant={badge.variant || "secondary"}>{badge.text}</Badge>
      )}
    </div>
  );
}
