// SOLID: Dependency Inversion Principle
// Concrete implementation of repository using Prisma

import type { PrismaClient } from "@prisma/client";
import type {
  IAnatomyRepository,
  AnatomyPartData,
  SynonymData,
} from "../interfaces";

export class PrismaAnatomyRepository implements IAnatomyRepository {
  constructor(private prisma: PrismaClient) {}

  async clearAll(): Promise<void> {
    await this.prisma.anatomySynonym.deleteMany();
    await this.prisma.anatomyPart.deleteMany();
  }

  async createPart(data: AnatomyPartData): Promise<string> {
    const part = await this.prisma.anatomyPart.create({
      data: {
        partId: data.partId,
        name: data.name,
        latinName: data.latinName,
        system: data.system,
        parentId: data.parentId,
        modelPath: data.modelPath,
        lodLevels: data.lodLevels ? JSON.stringify(data.lodLevels) : null,
        boundingBox: null,
      },
    });

    return part.id;
  }

  async createSynonyms(partId: string, synonyms: SynonymData[]): Promise<void> {
    if (synonyms.length === 0) return;

    await this.prisma.anatomySynonym.createMany({
      data: synonyms.map((syn) => ({
        partId,
        synonym: syn.synonym,
        language: syn.language,
        priority: syn.priority,
      })),
    });
  }

  async findPartByPartId(partId: string): Promise<{ id: string } | null> {
    return await this.prisma.anatomyPart.findUnique({
      where: { partId },
      select: { id: true },
    });
  }
}
