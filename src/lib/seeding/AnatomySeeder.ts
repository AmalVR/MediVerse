// SOLID: Single Responsibility Principle + Dependency Inversion
// Orchestrates the seeding process using abstractions

import type {
  IAnatomySeeder,
  IAnatomyRepository,
  IAnatomyDataProvider,
  IAnatomyValidator,
  SeedResult,
  AnatomyPartData,
} from "./interfaces";

export class AnatomySeeder implements IAnatomySeeder {
  constructor(
    private repository: IAnatomyRepository,
    private dataProvider: IAnatomyDataProvider,
    private validator: IAnatomyValidator,
    private options: {
      clearExisting?: boolean;
      validateData?: boolean;
      stopOnError?: boolean;
    } = {}
  ) {
    // Set defaults
    this.options = {
      clearExisting: true,
      validateData: true,
      stopOnError: false,
      ...options,
    };
  }

  async seed(): Promise<SeedResult> {
    const startTime = Date.now();
    let partsCreated = 0;
    let synonymsCreated = 0;
    const errors: string[] = [];

    try {
      console.log("🌱 Starting anatomy database seeding...");
      console.log(`📦 Data source: ${this.dataProvider.getSource()}`);

      // Load data
      console.log("📥 Loading anatomy data...");
      const anatomyData = await this.dataProvider.getAnatomyData();
      console.log(`📊 Loaded ${anatomyData.length} anatomy parts`);

      // Validate data
      if (this.options.validateData) {
        console.log("🔍 Validating data...");
        const validation = this.validator.validateBatch(anatomyData);

        if (!validation.valid) {
          console.log(
            `⚠️  Found ${validation.invalidItems.length} invalid items:`
          );
          validation.invalidItems.forEach(({ data, errors: itemErrors }) => {
            console.log(`  - ${data.partId}: ${itemErrors.join(", ")}`);
            errors.push(`${data.partId}: ${itemErrors.join(", ")}`);
          });

          if (this.options.stopOnError) {
            throw new Error("Validation failed");
          }
        }

        console.log(`✅ ${validation.validItems.length} items validated`);
      }

      // Clear existing data
      if (this.options.clearExisting) {
        console.log("🗑️  Clearing existing data...");
        await this.repository.clearAll();
        console.log("✅ Existing data cleared");
      }

      // Seed parts
      console.log("📝 Creating anatomy parts...");
      const dataToSeed = this.options.validateData
        ? this.validator.validateBatch(anatomyData).validItems
        : anatomyData;

      // Separate parts with and without parents
      const rootParts = dataToSeed.filter((p) => !p.parentId);
      const childParts = dataToSeed.filter((p) => p.parentId);

      // Create root parts first
      for (const partData of rootParts) {
        try {
          await this.seedPart(partData);
          partsCreated++;
          synonymsCreated += partData.synonyms?.length || 0;
        } catch (error) {
          const errorMsg = `Failed to create ${partData.partId}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);

          if (this.options.stopOnError) {
            throw error;
          }
        }
      }

      // Create child parts
      for (const partData of childParts) {
        try {
          await this.seedPart(partData);
          partsCreated++;
          synonymsCreated += partData.synonyms?.length || 0;
        } catch (error) {
          const errorMsg = `Failed to create ${partData.partId}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);

          if (this.options.stopOnError) {
            throw error;
          }
        }
      }

      const duration = Date.now() - startTime;

      console.log("\n✨ Seeding completed!");
      console.log(`📊 Parts created: ${partsCreated}`);
      console.log(`📊 Synonyms created: ${synonymsCreated}`);
      console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);

      if (errors.length > 0) {
        console.log(`⚠️  Errors: ${errors.length}`);
      }

      return {
        success: errors.length === 0 || !this.options.stopOnError,
        partsCreated,
        synonymsCreated,
        errors: errors.length > 0 ? errors : undefined,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Seeding failed:", errorMsg);

      return {
        success: false,
        partsCreated,
        synonymsCreated,
        errors: [errorMsg, ...errors],
        duration,
      };
    }
  }

  private async seedPart(partData: AnatomyPartData): Promise<void> {
    // Create the part
    const partId = await this.repository.createPart(partData);

    // Create synonyms
    if (partData.synonyms && partData.synonyms.length > 0) {
      await this.repository.createSynonyms(partId, partData.synonyms);
    }

    console.log(`✅ Created: ${partData.name} (${partData.partId})`);
  }
}
