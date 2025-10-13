import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCacheStats, clearModelCache } from "@/lib/model-cache";
import { HardDrive, Trash2, RefreshCw } from "lucide-react";

export function CacheManager() {
  const [stats, setStats] = useState<{
    count: number;
    totalSize: number;
    models: string[];
  }>({ count: 0, totalSize: 0, models: [] });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    const data = await getCacheStats();
    setStats(data);
    setLoading(false);
  };

  const handleClearCache = async () => {
    if (
      confirm(
        "Clear all cached models? They will be re-downloaded on next use."
      )
    ) {
      await clearModelCache();
      await loadStats();
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          Model Cache
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cached Models:</span>
            <span className="font-medium">{stats.count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Storage Used:</span>
            <span className="font-medium">{formatSize(stats.totalSize)}</span>
          </div>
        </div>

        {stats.models.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Cached:</div>
            <div className="text-xs space-y-0.5">
              {stats.models.map((model) => (
                <div
                  key={model}
                  className="text-cyan-400 truncate"
                  title={model}
                >
                  ✓ {model.split("/").pop()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadStats}
            disabled={loading}
            className="flex-1 text-xs"
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleClearCache}
            disabled={stats.count === 0}
            className="flex-1 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        <div className="text-xs text-muted-foreground italic border-t pt-2">
          💡 Models load instantly from cache after first download
        </div>
      </CardContent>
    </Card>
  );
}
