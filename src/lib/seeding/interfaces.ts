// SOLID: Interface Segregation Principle
// Separate interfaces for different concerns

import type { AnatomySystem } from "@/types/anatomy";

// Data structures
export interface AnatomyPartData {
  partId: string;
  name: string;
  latinName?: string;
  system: AnatomySystem;
  parentId?: string;
  modelPath?: string;
  lodLevels?: {
    low: string;
    medium: string;
    high: string;
  };
  synonyms?: SynonymData[];
}

export interface SynonymData {
  synonym: string;
  language: string;
  priority: number;
}

// SOLID: Dependency Inversion Principle
// Abstract repository interface instead of concrete Prisma
export interface IAnatomyRepository {
  clearAll(): Promise<void>;
  createPart(data: AnatomyPartData): Promise<string>; // Returns created ID
  createSynonyms(partId: string, synonyms: SynonymData[]): Promise<void>;
  findPartByPartId(partId: string): Promise<{ id: string } | null>;
}

// Data provider interface for Open/Closed Principle
export interface IAnatomyDataProvider {
  getAnatomyData(): Promise<AnatomyPartData[]>;
  getSource(): string; // For logging
}

// Seeder interface
export interface IAnatomySeeder {
  seed(): Promise<SeedResult>;
}

export interface SeedResult {
  success: boolean;
  partsCreated: number;
  synonymsCreated: number;
  errors?: string[];
  duration: number; // milliseconds
}

// Validation interface
export interface IAnatomyValidator {
  validate(data: AnatomyPartData): ValidationResult;
  validateBatch(data: AnatomyPartData[]): BatchValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface BatchValidationResult {
  valid: boolean;
  validItems: AnatomyPartData[];
  invalidItems: Array<{ data: AnatomyPartData; errors: string[] }>;
}
