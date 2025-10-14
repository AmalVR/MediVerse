import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  LayoutList,
  Search,
  Video,
  FileText,
  FileQuestion,
  Tag,
  Filter,
} from "lucide-react";
import type {
  ContentType,
  EducationalContent,
  ContentFilters,
} from "@/lib/education/types";

interface ContentListProps {
  contents: EducationalContent[];
  onSelect: (content: EducationalContent) => void;
  onFilter: (filters: ContentFilters) => void;
}

export function ContentList({
  contents,
  onSelect,
  onFilter,
}: ContentListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get unique tags from all content
  const allTags = Array.from(
    new Set(contents.flatMap((content) => content.tags))
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onFilter({
      search: term,
      type: selectedType === "all" ? undefined : selectedType,
      tags: selectedTags.length ? selectedTags : undefined,
    });
  };

  const handleTypeChange = (type: ContentType | "all") => {
    setSelectedType(type);
    onFilter({
      search: searchTerm,
      type: type === "all" ? undefined : type,
      tags: selectedTags.length ? selectedTags : undefined,
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilter({
      search: searchTerm,
      type: selectedType === "all" ? undefined : selectedType,
      tags: newTags.length ? newTags : undefined,
    });
  };

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "note":
        return <FileText className="h-5 w-5" />;
      case "question_paper":
        return <FileQuestion className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select
          value={selectedType}
          onValueChange={(value) =>
            handleTypeChange(value as ContentType | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="note">Notes</SelectItem>
            <SelectItem value="question_paper">Quizzes</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-accent" : ""}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-accent" : ""}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {allTags.map((tag) => (
          <Button
            key={tag}
            variant="outline"
            size="sm"
            onClick={() => handleTagToggle(tag)}
            className={
              selectedTags.includes(tag)
                ? "bg-accent text-accent-foreground"
                : ""
            }
          >
            <Tag className="mr-1 h-3 w-3" />
            {tag}
          </Button>
        ))}
      </div>

      {/* Content Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contents.map((content) => (
            <div
              key={content.id}
              className="group relative bg-card hover:bg-accent/5 rounded-lg border p-4 transition-colors cursor-pointer"
              onClick={() => onSelect(content)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getContentIcon(content.type)}
                  <div>
                    <h3 className="font-medium line-clamp-1">
                      {content.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                <span className="capitalize">{content.type}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {contents.map((content) => (
            <div
              key={content.id}
              className="group flex items-center gap-4 bg-card hover:bg-accent/5 rounded-lg border p-4 transition-colors cursor-pointer"
              onClick={() => onSelect(content)}
            >
              {getContentIcon(content.type)}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-1">{content.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {content.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {content.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{new Date(content.createdAt).toLocaleDateString()}</div>
                <div className="capitalize">{content.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
