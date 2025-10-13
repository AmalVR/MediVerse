// Seed anatomy database with Z-Anatomy parts

import { PrismaClient } from "@prisma/client";
import { AnatomySystem } from "../src/types/anatomy";

const prisma = new PrismaClient();

const anatomyData = [
  // SKELETAL SYSTEM
  {
    partId: "skeleton",
    name: "Skeleton",
    latinName: "Skeletos",
    system: AnatomySystem.SKELETAL,
    modelPath: "/models/skeleton/skeleton-full.glb",
    lodLevels: {
      low: "/models/skeleton/skeleton-low.glb",
      medium: "/models/skeleton/skeleton-med.glb",
      high: "/models/skeleton/skeleton-full.glb",
    },
    synonyms: [
      { synonym: "skeleton", language: "en", priority: 10 },
      { synonym: "skeletal system", language: "en", priority: 9 },
      { synonym: "bones", language: "en", priority: 8 },
    ],
  },
  {
    partId: "skull",
    name: "Skull",
    latinName: "Cranium",
    system: AnatomySystem.SKELETAL,
    parentId: "skeleton",
    modelPath: "/models/skeleton/skull.glb",
    synonyms: [
      { synonym: "skull", language: "en", priority: 10 },
      { synonym: "cranium", language: "en", priority: 9 },
      { synonym: "head bone", language: "en", priority: 5 },
    ],
  },
  {
    partId: "femur_left",
    name: "Left Femur",
    latinName: "Femur Sinister",
    system: AnatomySystem.SKELETAL,
    parentId: "skeleton",
    modelPath: "/models/skeleton/femur-left.glb",
    synonyms: [
      { synonym: "left femur", language: "en", priority: 10 },
      { synonym: "left thigh bone", language: "en", priority: 8 },
      { synonym: "femur", language: "en", priority: 5 },
    ],
  },
  {
    partId: "femur_right",
    name: "Right Femur",
    latinName: "Femur Dexter",
    system: AnatomySystem.SKELETAL,
    parentId: "skeleton",
    modelPath: "/models/skeleton/femur-right.glb",
    synonyms: [
      { synonym: "right femur", language: "en", priority: 10 },
      { synonym: "right thigh bone", language: "en", priority: 8 },
    ],
  },

  // CARDIOVASCULAR SYSTEM
  {
    partId: "heart",
    name: "Heart",
    latinName: "Cor",
    system: AnatomySystem.CARDIOVASCULAR,
    modelPath: "/models/cardiovascular/heart.glb",
    lodLevels: {
      low: "/models/cardiovascular/heart-low.glb",
      medium: "/models/cardiovascular/heart-med.glb",
      high: "/models/cardiovascular/heart.glb",
    },
    synonyms: [
      { synonym: "heart", language: "en", priority: 10 },
      { synonym: "cardiac muscle", language: "en", priority: 8 },
      { synonym: "cor", language: "la", priority: 7 },
      { synonym: "corazón", language: "es", priority: 9 },
      { synonym: "心臓", language: "ja", priority: 9 },
    ],
  },
  {
    partId: "heart_left_ventricle",
    name: "Left Ventricle",
    latinName: "Ventriculus Sinister",
    system: AnatomySystem.CARDIOVASCULAR,
    parentId: "heart",
    modelPath: "/models/cardiovascular/left-ventricle.glb",
    synonyms: [
      { synonym: "left ventricle", language: "en", priority: 10 },
      { synonym: "left chamber", language: "en", priority: 7 },
    ],
  },

  // RESPIRATORY SYSTEM
  {
    partId: "lungs",
    name: "Lungs",
    latinName: "Pulmones",
    system: AnatomySystem.RESPIRATORY,
    modelPath: "/models/respiratory/lungs.glb",
    synonyms: [
      { synonym: "lungs", language: "en", priority: 10 },
      { synonym: "respiratory organs", language: "en", priority: 6 },
      { synonym: "pulmones", language: "es", priority: 9 },
    ],
  },
  {
    partId: "lung_left",
    name: "Left Lung",
    latinName: "Pulmo Sinister",
    system: AnatomySystem.RESPIRATORY,
    parentId: "lungs",
    modelPath: "/models/respiratory/lung-left.glb",
    synonyms: [{ synonym: "left lung", language: "en", priority: 10 }],
  },
  {
    partId: "lung_right",
    name: "Right Lung",
    latinName: "Pulmo Dexter",
    system: AnatomySystem.RESPIRATORY,
    parentId: "lungs",
    modelPath: "/models/respiratory/lung-right.glb",
    synonyms: [{ synonym: "right lung", language: "en", priority: 10 }],
  },

  // NERVOUS SYSTEM
  {
    partId: "brain",
    name: "Brain",
    latinName: "Cerebrum",
    system: AnatomySystem.NERVOUS,
    modelPath: "/models/nervous/brain.glb",
    synonyms: [
      { synonym: "brain", language: "en", priority: 10 },
      { synonym: "cerebrum", language: "en", priority: 8 },
      { synonym: "cerebro", language: "es", priority: 9 },
    ],
  },

  // MUSCULAR SYSTEM
  {
    partId: "biceps_brachii",
    name: "Biceps Brachii",
    latinName: "Musculus Biceps Brachii",
    system: AnatomySystem.MUSCULAR,
    modelPath: "/models/muscular/biceps.glb",
    synonyms: [
      { synonym: "biceps", language: "en", priority: 10 },
      { synonym: "biceps brachii", language: "en", priority: 9 },
      { synonym: "arm muscle", language: "en", priority: 5 },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding anatomy database...");
  console.log("ℹ️  Note: Model files don't need to exist yet!");
  console.log("ℹ️  See docs/Z_ANATOMY_MODELS.md for how to add 3D models\n");

  try {
    // Clear existing data
    await prisma.anatomySynonym.deleteMany();
    await prisma.anatomyPart.deleteMany();

    // Map to track partId -> database ID for parent references
    const partIdMap = new Map<string, string>();

    // Separate root parts (no parent) and child parts (have parent)
    const rootParts = anatomyData.filter((item) => !item.parentId);
    const childParts = anatomyData.filter((item) => item.parentId);

    console.log(`📦 Creating ${rootParts.length} root parts first...`);

    // Create root parts first
    for (const item of rootParts) {
      const { synonyms, lodLevels, parentId, ...partData } = item;

      const part = await prisma.anatomyPart.create({
        data: {
          ...partData,
          lodLevels: lodLevels ? JSON.stringify(lodLevels) : undefined,
          boundingBox: undefined,
        },
      });

      partIdMap.set(item.partId, part.id);

      // Create synonyms
      if (synonyms) {
        await prisma.anatomySynonym.createMany({
          data: synonyms.map((syn) => ({
            partId: part.id,
            ...syn,
          })),
        });
      }

      console.log(`✅ Created: ${part.name} (${part.partId})`);
    }

    console.log(`\n📦 Creating ${childParts.length} child parts...`);

    // Create child parts
    for (const item of childParts) {
      const { synonyms, lodLevels, parentId, ...partData } = item;

      // Get parent database ID from map
      const parentDbId = parentId ? partIdMap.get(parentId) : undefined;

      if (parentId && !parentDbId) {
        console.error(
          `⚠️  Warning: Parent '${parentId}' not found for ${item.partId}, skipping...`
        );
        continue;
      }

      const part = await prisma.anatomyPart.create({
        data: {
          ...partData,
          parentId: parentDbId,
          lodLevels: lodLevels ? JSON.stringify(lodLevels) : undefined,
          boundingBox: undefined,
        },
      });

      partIdMap.set(item.partId, part.id);

      // Create synonyms
      if (synonyms) {
        await prisma.anatomySynonym.createMany({
          data: synonyms.map((syn) => ({
            partId: part.id,
            ...syn,
          })),
        });
      }

      console.log(`✅ Created: ${part.name} (${part.partId})`);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log(`📊 Created ${anatomyData.length} anatomy parts`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
