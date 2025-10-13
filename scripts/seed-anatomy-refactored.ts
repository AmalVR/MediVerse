// Refactored seed script following SOLID principles

import { PrismaClient } from "@prisma/client";
import { AnatomySeederFactory } from "../src/lib/seeding/AnatomySeederFactory";

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("🌱 MediVerse Anatomy Database Seeder (SOLID Architecture)");
    console.log("ℹ️  Using SOLID principles with dependency injection");
    console.log("ℹ️  Model files don't need to exist yet!");
    console.log("ℹ️  See docs/Z_ANATOMY_MODELS.md for 3D model setup");
    console.log("ℹ️  See docs/CODE_ARCHITECTURE.md for SOLID principles\n");

    // SOLID: Factory Pattern + Dependency Injection
    // Factory handles all dependency construction
    const seeder = AnatomySeederFactory.createDefault(prisma, {
      clearExisting: true,
      validateData: true,
      stopOnError: false, // Continue even if some items fail
    });

    // Execute seeding
    const result = await seeder.seed();

    // Report results
    if (result.success) {
      console.log("\n🎉 Seeding successful!");
      process.exit(0);
    } else {
      console.error("\n⚠️  Seeding completed with errors");
      if (result.errors) {
        console.error("Errors:", result.errors);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
