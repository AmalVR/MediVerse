import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Note {
  content: string;
  timestamp: number;
}

interface StudentNotepadProps {
  sessionId: string;
  studentId: string;
}

export function StudentNotepad({ sessionId, studentId }: StudentNotepadProps) {
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  const loadNotes = useCallback(async () => {
    try {
      // Load from localStorage (TODO: implement API endpoint)
      const key = `notes_${sessionId}_${studentId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: Note[] = JSON.parse(stored);
        setSavedNotes(parsed);
        if (parsed.length > 0) {
          setNotes(parsed[0].content);
        }
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }, [sessionId, studentId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNote = async () => {
    if (!notes.trim()) {
      toast({
        title: "Empty note",
        description: "Please write something before saving",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to localStorage (TODO: implement API endpoint)
      const key = `notes_${sessionId}_${studentId}`;
      const newNote = {
        id: Date.now().toString(),
        content: notes,
        created_at: new Date().toISOString(),
        session_id: sessionId,
        student_id: studentId,
      };

      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(newNote);
      localStorage.setItem(key, JSON.stringify(existing));

      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });

      loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          Session Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
        <Textarea
          placeholder="Take notes during the session..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[200px] sm:min-h-[300px] resize-none text-sm"
        />

        <Button
          onClick={saveNote}
          className="w-full gap-2 text-sm sm:text-base"
        >
          <Save className="h-3 w-3 sm:h-4 sm:w-4" />
          Save Note
        </Button>

        {savedNotes.length > 0 && (
          <div className="mt-3 sm:mt-4 space-y-2">
            <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground">
              Previous Notes ({savedNotes.length})
            </h4>
            <div className="space-y-2 max-h-[150px] sm:max-h-[200px] overflow-y-auto">
              {savedNotes.slice(0, 5).map((note) => (
                <Card key={note.id} className="p-3">
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1 line-clamp-2">{note.content}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
