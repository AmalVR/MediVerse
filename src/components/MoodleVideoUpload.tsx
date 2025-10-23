import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Video,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  MoodleContentService,
  MoodleVideoMetadata,
} from "@/lib/moodle/content";

interface MoodleVideoUploadProps {
  courseId: number;
  onUploadComplete?: (fileId: number) => void;
  onUploadError?: (error: string) => void;
}

export function MoodleVideoUpload({
  courseId,
  onUploadComplete,
  onUploadError,
}: MoodleVideoUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState<MoodleVideoMetadata>({
    title: "",
    description: "",
    tags: [],
    category: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentService = new MoodleContentService(
    // This would be injected or created from context
    {} as any // Placeholder - would need proper API service instance
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!metadata.title) {
        setMetadata((prev) => ({ ...prev, title: file.name }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!metadata.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the video.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await contentService.uploadVideoToMoodleCourse(
        courseId,
        selectedFile,
        metadata
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.fileId) {
        toast({
          title: "Upload successful",
          description: "Video has been uploaded to Moodle course.",
        });

        onUploadComplete?.(result.fileId);

        // Reset form
        setSelectedFile(null);
        setMetadata({ title: "", description: "", tags: [], category: "" });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });

      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-500" />
          Upload Video to Moodle Course
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="video-file">Select Video File</Label>
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="flex-1"
            />
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </div>
            )}
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {selectedFile.name}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-title">Title *</Label>
            <Input
              id="video-title"
              value={metadata.title}
              onChange={(e) =>
                setMetadata((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter video title"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description">Description</Label>
            <Textarea
              id="video-description"
              value={metadata.description}
              onChange={(e) =>
                setMetadata((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter video description"
              disabled={isUploading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-category">Category</Label>
            <Select
              value={metadata.category}
              onValueChange={(value) =>
                setMetadata((prev) => ({ ...prev, category: value }))
              }
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardiovascular">
                  Cardiovascular System
                </SelectItem>
                <SelectItem value="muscular">Muscular System</SelectItem>
                <SelectItem value="nervous">Nervous System</SelectItem>
                <SelectItem value="respiratory">Respiratory System</SelectItem>
                <SelectItem value="skeleton">Skeletal System</SelectItem>
                <SelectItem value="general">General Anatomy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-tags">Tags (comma-separated)</Label>
            <Input
              id="video-tags"
              value={metadata.tags?.join(", ") || ""}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean);
                setMetadata((prev) => ({ ...prev, tags }));
              }}
              placeholder="anatomy, heart, cardiovascular"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !metadata.title.trim() || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload to Moodle
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
