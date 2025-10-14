/**
 * Settings Panel Component
 * Contains cache management and other settings
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CacheManager } from "@/components/CacheManager";
import { Settings } from "lucide-react";

export function SettingsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background/95 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage application settings and cache
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Cache Management</h3>
            <CacheManager />
          </div>

          {/* Add more settings sections here */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Performance</h3>
            <div className="text-sm text-muted-foreground">
              More settings coming soon...
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
