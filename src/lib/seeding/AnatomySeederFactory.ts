// SOLID: Factory Pattern for complex object construction
// Simplifies creating seeder with all dependencies

import type { PrismaClient } from "@prisma/client";
import type { IAnatomySeeder } from "./interfaces";
import { AnatomySeeder } from "./AnatomySeeder";
import { PrismaAnatomyRepository } from "./repositories/PrismaAnatomyRepository";
import { ZAnatomyDataProvider } from "./data-providers/ZAnatomyDataProvider";
import { JsonAnatomyDataProvider } from "./data-providers/JsonDataProvider";
import { AnatomyDataValidator } from "./validators/AnatomyDataValidator";

export class AnatomySeederFactory {
  /**
   * Create seeder with default Z-Anatomy data provider
   */
  static createDefault(
    prisma: PrismaClient,
    options?: {
      clearExisting?: boolean;
      validateData?: boolean;
      stopOnError?: boolean;
    }
  ): IAnatomySeeder {
    return new AnatomySeeder(
      new PrismaAnatomyRepository(prisma),
      new ZAnatomyDataProvider(),
      new AnatomyDataValidator(),
      options
    );
  }

  /**
   * Create seeder with JSON file data provider
   */
  static createFromJson(
    prisma: PrismaClient,
    jsonFilePath: string,
    options?: {
      clearExisting?: boolean;
      validateData?: boolean;
      stopOnError?: boolean;
    }
  ): IAnatomySeeder {
    return new AnatomySeeder(
      new PrismaAnatomyRepository(prisma),
      new JsonAnatomyDataProvider(jsonFilePath),
      new AnatomyDataValidator(),
      options
    );
  }

  /**
   * Create seeder for testing (no validation, doesn't clear)
   */
  static createForTesting(
    prisma: PrismaClient,
    jsonFilePath: string
  ): IAnatomySeeder {
    return new AnatomySeeder(
      new PrismaAnatomyRepository(prisma),
      new JsonAnatomyDataProvider(jsonFilePath),
      new AnatomyDataValidator(),
      {
        clearExisting: false,
        validateData: false,
        stopOnError: true,
      }
    );
  }

  /**
   * Create seeder for production (strict validation, fail fast)
   */
  static createForProduction(
    prisma: PrismaClient,
    jsonFilePath: string
  ): IAnatomySeeder {
    return new AnatomySeeder(
      new PrismaAnatomyRepository(prisma),
      new JsonAnatomyDataProvider(jsonFilePath),
      new AnatomyDataValidator(),
      {
        clearExisting: false, // Don't clear existing data in production
        validateData: true,
        stopOnError: true, // Fail fast on errors
      }
    );
  }
}
