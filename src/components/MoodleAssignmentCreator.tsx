import React, { useState } from "react";
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
import { Calendar, FileText, CheckCircle, Loader2 } from "lucide-react";
import {
  MoodleContentService,
  MoodleAssignmentData,
} from "@/lib/moodle/content";

interface MoodleAssignmentCreatorProps {
  courseId: number;
  onAssignmentCreated?: (assignmentId: number) => void;
  onAssignmentError?: (error: string) => void;
}

export function MoodleAssignmentCreator({
  courseId,
  onAssignmentCreated,
  onAssignmentError,
}: MoodleAssignmentCreatorProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [assignmentData, setAssignmentData] = useState<MoodleAssignmentData>({
    name: "",
    intro: "",
    duedate: 0,
    allowsubmissionsfromdate: 0,
    grade: 100,
    assignmenttype: "online",
  });

  const contentService = new MoodleContentService(
    // This would be injected or created from context
    {} as any // Placeholder - would need proper API service instance
  );

  const handleCreateAssignment = async () => {
    if (!assignmentData.name.trim()) {
      toast({
        title: "Assignment name required",
        description: "Please enter a name for the assignment.",
        variant: "destructive",
      });
      return;
    }

    if (!assignmentData.intro.trim()) {
      toast({
        title: "Assignment description required",
        description: "Please enter a description for the assignment.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const result = await contentService.createMoodleAssignment(
        courseId,
        assignmentData
      );

      if (result.success && result.assignmentId) {
        toast({
          title: "Assignment created successfully",
          description: "Assignment has been created in Moodle course.",
        });

        onAssignmentCreated?.(result.assignmentId);

        // Reset form
        setAssignmentData({
          name: "",
          intro: "",
          duedate: 0,
          allowsubmissionsfromdate: 0,
          grade: 100,
          assignmenttype: "online",
        });
      } else {
        throw new Error(result.error || "Assignment creation failed");
      }
    } catch (error) {
      console.error("Assignment creation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Assignment creation failed";

      toast({
        title: "Assignment creation failed",
        description: errorMessage,
        variant: "destructive",
      });

      onAssignmentError?.(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    if (timestamp === 0) return "No due date";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const setDateFromInput = (
    field: "duedate" | "allowsubmissionsfromdate",
    value: string
  ) => {
    if (!value) {
      setAssignmentData((prev) => ({ ...prev, [field]: 0 }));
      return;
    }

    const timestamp = Math.floor(new Date(value).getTime() / 1000);
    setAssignmentData((prev) => ({ ...prev, [field]: timestamp }));
  };

  const getDateInputValue = (timestamp: number): string => {
    if (timestamp === 0) return "";
    return new Date(timestamp * 1000).toISOString().split("T")[0];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-500" />
          Create Assignment for Moodle Course
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Assignment Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-name">Assignment Name *</Label>
            <Input
              id="assignment-name"
              value={assignmentData.name}
              onChange={(e) =>
                setAssignmentData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter assignment name"
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-intro">Description *</Label>
            <Textarea
              id="assignment-intro"
              value={assignmentData.intro}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  intro: e.target.value,
                }))
              }
              placeholder="Enter assignment description and instructions"
              disabled={isCreating}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-type">Assignment Type</Label>
            <Select
              value={assignmentData.assignmenttype}
              onValueChange={(value) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  assignmenttype: value,
                }))
              }
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online Text</SelectItem>
                <SelectItem value="upload">File Upload</SelectItem>
                <SelectItem value="uploadsingle">Single File Upload</SelectItem>
                <SelectItem value="offline">Offline Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dates and Grading */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allow-from-date">Allow Submissions From</Label>
              <Input
                id="allow-from-date"
                type="date"
                value={getDateInputValue(
                  assignmentData.allowsubmissionsfromdate
                )}
                onChange={(e) =>
                  setDateFromInput("allowsubmissionsfromdate", e.target.value)
                }
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={getDateInputValue(assignmentData.duedate)}
                onChange={(e) => setDateFromInput("duedate", e.target.value)}
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-grade">Maximum Grade</Label>
            <Input
              id="assignment-grade"
              type="number"
              value={assignmentData.grade}
              onChange={(e) =>
                setAssignmentData((prev) => ({
                  ...prev,
                  grade: parseInt(e.target.value) || 100,
                }))
              }
              placeholder="100"
              disabled={isCreating}
              min="1"
              max="1000"
            />
          </div>
        </div>

        {/* Assignment Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">
                  {assignmentData.name || "Assignment Name"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {assignmentData.intro ||
                    "Assignment description will appear here"}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due: {formatDate(assignmentData.duedate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>Type: {assignmentData.assignmenttype}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Max Grade: {assignmentData.grade}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateAssignment}
          disabled={
            !assignmentData.name.trim() ||
            !assignmentData.intro.trim() ||
            isCreating
          }
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Assignment...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Create Assignment in Moodle
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
