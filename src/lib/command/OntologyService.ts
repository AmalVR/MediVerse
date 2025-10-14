import { IOntologyService } from "./types";
import { prisma } from "@/lib/db";

export class OntologyService implements IOntologyService {
  async resolveAnatomyPart(term: string): Promise<string | null> {
    // First try exact match
    const exactMatch = await prisma.anatomyPart.findFirst({
      where: {
        OR: [
          { name: { equals: term, mode: "insensitive" } },
          { latinName: { equals: term, mode: "insensitive" } },
        ],
      },
    });

    if (exactMatch) {
      return exactMatch.partId;
    }

    // Try synonym match
    const synonymMatch = await prisma.anatomySynonym.findFirst({
      where: {
        synonym: { equals: term, mode: "insensitive" },
      },
      include: {
        part: true,
      },
    });

    if (synonymMatch) {
      return synonymMatch.part.partId;
    }

    // Try fuzzy match
    const fuzzyMatch = await prisma.anatomyPart.findFirst({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { latinName: { contains: term, mode: "insensitive" } },
        ],
      },
    });

    return fuzzyMatch?.partId || null;
  }

  async validateAnatomyPart(partId: string): Promise<boolean> {
    const part = await prisma.anatomyPart.findUnique({
      where: { partId },
    });

    return !!part;
  }

  async getRelatedParts(partId: string): Promise<string[]> {
    const part = await prisma.anatomyPart.findUnique({
      where: { partId },
      include: {
        children: {
          select: { partId: true },
        },
        parent: {
          select: { partId: true },
        },
      },
    });

    if (!part) return [];

    const relatedParts = [
      ...(part.children?.map((c) => c.partId) || []),
      ...(part.parent ? [part.parent.partId] : []),
    ];

    return relatedParts;
  }

  async getSystemForPart(partId: string): Promise<string | null> {
    const part = await prisma.anatomyPart.findUnique({
      where: { partId },
      select: { system: true },
    });

    return part?.system || null;
  }
}
