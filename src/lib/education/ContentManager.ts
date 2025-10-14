import {
  IContentManager,
  EducationalContent,
  ContentFilters,
  VideoTutorial,
} from "./types";
import { prisma } from "@/lib/db";
import { uploadToStorage, deleteFromStorage } from "@/lib/storage";

export class ContentManager implements IContentManager {
  async uploadContent(content: Partial<EducationalContent>): Promise<string> {
    try {
      // Handle file uploads if present
      let uploadedUrls: string[] = [];
      if (content.type === "video") {
        const videoContent = content as Partial<VideoTutorial>;
        if (videoContent.url && videoContent.url.startsWith("data:")) {
          // Upload video file
          const videoUrl = await uploadToStorage(
            videoContent.url,
            "videos",
            content.authorId
          );
          videoContent.url = videoUrl;

          // Generate and upload thumbnail if not provided
          if (!videoContent.thumbnailUrl) {
            videoContent.thumbnailUrl = await this.generateThumbnail(videoUrl);
          }
        }
      }

      // Create content record in database
      const createdContent = await prisma.educationalContent.create({
        data: {
          ...content,
          id: undefined, // Let Prisma generate the ID
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return createdContent.id;
    } catch (error) {
      // Clean up any uploaded files if database operation fails
      await Promise.all(uploadedUrls.map((url) => deleteFromStorage(url)));
      throw error;
    }
  }

  async getContent(id: string): Promise<EducationalContent | null> {
    const content = await prisma.educationalContent.findUnique({
      where: { id },
      include: {
        questions: true,
        attachments: true,
      },
    });

    return content;
  }

  async listContent(filters?: ContentFilters): Promise<EducationalContent[]> {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.systemId) {
      where.systemId = filters.systemId;
    }

    if (filters?.partId) {
      where.partId = filters.partId;
    }

    if (filters?.tags?.length) {
      where.tags = {
        hasAll: filters.tags,
      };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const content = await prisma.educationalContent.findMany({
      where,
      include: {
        questions: true,
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return content;
  }

  async updateContent(
    id: string,
    updates: Partial<EducationalContent>
  ): Promise<void> {
    await prisma.educationalContent.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  }

  async deleteContent(id: string): Promise<void> {
    const content = await this.getContent(id);
    if (!content) return;

    // Delete associated files
    if (content.type === "video") {
      const video = content as VideoTutorial;
      await deleteFromStorage(video.url);
      if (video.thumbnailUrl) {
        await deleteFromStorage(video.thumbnailUrl);
      }
    }

    // Delete from database
    await prisma.educationalContent.delete({
      where: { id },
    });
  }

  private async generateThumbnail(videoUrl: string): Promise<string> {
    // TODO: Implement video thumbnail generation
    // This could use FFmpeg or a cloud function
    return "";
  }
}
