// Public API for seeding module
// SOLID: Interface Segregation - Export only what's needed

export { AnatomySeeder } from "./AnatomySeeder";
export { AnatomySeederFactory } from "./AnatomySeederFactory";
export { PrismaAnatomyRepository } from "./repositories/PrismaAnatomyRepository";
export { ZAnatomyDataProvider } from "./data-providers/ZAnatomyDataProvider";
export { JsonAnatomyDataProvider } from "./data-providers/JsonDataProvider";
export { AnatomyDataValidator } from "./validators/AnatomyDataValidator";

export type {
  IAnatomySeeder,
  IAnatomyRepository,
  IAnatomyDataProvider,
  IAnatomyValidator,
  AnatomyPartData,
  SynonymData,
  SeedResult,
  ValidationResult,
  BatchValidationResult,
} from "./interfaces";
