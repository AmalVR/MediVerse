import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  borderColor?: string;
  bgColor?: string;
  features?: string[];
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  action?: {
    text: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
  };
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  borderColor = "border-blue-200",
  bgColor = "bg-blue-50/50",
  features = [],
  badge,
  action,
  className = "",
}: FeatureCardProps) {
  return (
    <Card className={`${borderColor} ${bgColor} ${className}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        {features.length > 0 && (
          <div className="space-y-2 text-xs">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-current rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
        {badge && (
          <div className="mt-3">
            <Badge variant={badge.variant || "secondary"}>{badge.text}</Badge>
          </div>
        )}
        {action && (
          <div className="mt-3">
            <Button
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              className="w-full"
            >
              {action.text}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
