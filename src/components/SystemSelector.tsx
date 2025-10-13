import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bone,
  Heart,
  Brain,
  Activity,
  Wind,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

interface SystemSelectorProps {
  selectedSystems: string[];
  onSystemToggle: (system: string) => void;
}

const systemConfig = [
  {
    id: "skeleton",
    name: "Skeletal",
    icon: Bone,
    color: "#E8E8E8",
    description: "Bones and joints",
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular",
    icon: Heart,
    color: "#DC143C",
    description: "Heart and blood vessels",
  },
  {
    id: "nervous",
    name: "Nervous",
    icon: Brain,
    color: "#9370DB",
    description: "Brain and nerves",
  },
  {
    id: "muscular",
    name: "Muscular",
    icon: Activity,
    color: "#FF6347",
    description: "Muscles and tendons",
  },
  {
    id: "respiratory",
    name: "Respiratory",
    icon: Wind,
    color: "#FFC0CB",
    description: "Lungs and airways",
  },
];

export function SystemSelector({
  selectedSystems,
  onSystemToggle,
}: SystemSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-sm">Anatomical Systems</h3>
            <Badge variant="secondary" className="text-xs">
              {selectedSystems.length} active
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {systemConfig.map((system) => {
              const Icon = system.icon;
              const isSelected = selectedSystems.includes(system.id);

              return (
                <div
                  key={system.id}
                  className={`
                    relative p-3 rounded-lg border cursor-pointer transition-all
                    ${
                      isSelected
                        ? "bg-primary/10 border-primary/30 shadow-sm"
                        : "bg-muted/50 border-border hover:bg-muted/80"
                    }
                  `}
                  onClick={() => onSystemToggle(system.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-md"
                      style={{ backgroundColor: `${system.color}20` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: system.color }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{system.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {system.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-primary">
                          <Eye className="w-3 h-3" />
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <EyeOff className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            💡 Tip: Select multiple systems to view them together
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
