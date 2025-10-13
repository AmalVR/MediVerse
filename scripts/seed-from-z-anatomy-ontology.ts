// Seed database with extracted Z-Anatomy ontology

import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

interface ZAnatomyPart {
  partId: string;
  name: string;
  system: string;
  modelPath: string;
  meshName: string;
  synonyms: Array<{
    synonym: string;
    language: string;
    priority: number;
  }>;
}

async function seedFromOntology() {
  console.log("🌱 Seeding database with Z-Anatomy ontology...");

  try {
    // Load ontology JSON
    const ontologyPath = path.join(
      process.cwd(),
      "data",
      "z-anatomy-ontology.json"
    );

    const ontologyData = await fs.readFile(ontologyPath, "utf-8");
    const anatomy: ZAnatomyPart[] = JSON.parse(ontologyData);

    console.log(`📦 Loaded ${anatomy.length} parts from ontology`);

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.anatomySynonym.deleteMany();
    await prisma.anatomyPart.deleteMany();

    // Group by system for organized output
    const bySys: Record<string, ZAnatomyPart[]> = {};
    anatomy.forEach((part) => {
      if (!bySystem[part.system]) {
        bySystem[part.system] = [];
      }
      bySystem[part.system].push(part);
    });

    let totalCreated = 0;
    let totalSynonyms = 0;

    // Seed each system
    for (const [system, parts] of Object.entries(bySystem)) {
      console.log(`\n📦 Creating ${system} system (${parts.length} parts)...`);

      for (const partData of parts) {
        const part = await prisma.anatomyPart.create({
          data: {
            partId: partData.partId,
            name: partData.name,
            system: partData.system as any,
            modelPath: partData.modelPath,
            lodLevels: null,
            boundingBox: null,
          },
        });

        // Create synonyms
        if (partData.synonyms && partData.synonyms.length > 0) {
          await prisma.anatomySynonym.createMany({
            data: partData.synonyms.map((syn) => ({
              partId: part.id,
              ...syn,
            })),
          });
          totalSynonyms += partData.synonyms.length;
        }

        totalCreated++;

        if (totalCreated % 50 == 0) {
          console.log(`  ✅ Created ${totalCreated} parts...`);
        }
      }

      console.log(`✅ ${system}: ${parts.length} parts created`);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log(`📊 Total parts: ${totalCreated}`);
    console.log(`📊 Total synonyms: ${totalSynonyms}`);
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      console.error("❌ Ontology file not found!");
      console.error("\n📝 Run this first:");
      console.error(
        "blender --background public/models/Z-Anatomy/Startup.blend \\"
      );
      console.error("  --python scripts/extract-z-anatomy-ontology.py");
    } else {
      console.error("❌ Seeding failed:", error);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFromOntology();
