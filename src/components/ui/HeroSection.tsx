import { Button } from "@/components/ui/button";
import { Brain, BookOpen } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  primaryAction: {
    text: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction: {
    text: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  className = "",
}: HeroSectionProps) {
  const PrimaryIcon = primaryAction.icon || Brain;
  const SecondaryIcon = secondaryAction.icon || BookOpen;

  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white ${className}`}
    >
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-blue-100">{subtitle}</p>
          </div>
        </div>
        <p className="text-lg text-blue-100 mb-6 max-w-2xl">{description}</p>
        <div className="flex gap-4">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={primaryAction.onClick}
          >
            <PrimaryIcon className="h-5 w-5 mr-2" />
            {primaryAction.text}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 text-black hover:bg-white/10"
            onClick={secondaryAction.onClick}
          >
            <SecondaryIcon className="h-5 w-5 mr-2" />
            {secondaryAction.text}
          </Button>
        </div>
      </div>
    </div>
  );
}
