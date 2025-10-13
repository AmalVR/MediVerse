// SOLID: Single Responsibility Principle
// Only handles validation logic

import type {
  IAnatomyValidator,
  AnatomyPartData,
  ValidationResult,
  BatchValidationResult,
} from "../interfaces";
import { AnatomySystem } from "@/types/anatomy";

export class AnatomyDataValidator implements IAnatomyValidator {
  validate(data: AnatomyPartData): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!data.partId || data.partId.trim() === "") {
      errors.push("partId is required");
    }

    if (!data.name || data.name.trim() === "") {
      errors.push("name is required");
    }

    if (!data.system) {
      errors.push("system is required");
    }

    // Validate system is valid enum
    if (data.system && !Object.values(AnatomySystem).includes(data.system)) {
      errors.push(`Invalid system: ${data.system}`);
    }

    // Validate partId format (should be snake_case)
    if (data.partId && !/^[a-z0-9_]+$/.test(data.partId)) {
      errors.push("partId must be lowercase with underscores only");
    }

    // Validate model paths
    if (data.modelPath && !data.modelPath.startsWith("/models/")) {
      errors.push("modelPath must start with /models/");
    }

    // Validate LOD levels if present
    if (data.lodLevels) {
      if (
        !data.lodLevels.low ||
        !data.lodLevels.medium ||
        !data.lodLevels.high
      ) {
        errors.push(
          "All LOD levels (low, medium, high) are required when lodLevels is set"
        );
      }
    }

    // Validate synonyms
    if (data.synonyms) {
      data.synonyms.forEach((syn, index) => {
        if (!syn.synonym || syn.synonym.trim() === "") {
          errors.push(`Synonym at index ${index} is empty`);
        }
        if (!syn.language || syn.language.length !== 2) {
          errors.push(`Synonym at index ${index} has invalid language code`);
        }
        if (syn.priority < 0 || syn.priority > 100) {
          errors.push(
            `Synonym at index ${index} has invalid priority (must be 0-100)`
          );
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateBatch(data: AnatomyPartData[]): BatchValidationResult {
    const validItems: AnatomyPartData[] = [];
    const invalidItems: Array<{ data: AnatomyPartData; errors: string[] }> = [];

    data.forEach((item) => {
      const result = this.validate(item);
      if (result.valid) {
        validItems.push(item);
      } else {
        invalidItems.push({
          data: item,
          errors: result.errors,
        });
      }
    });

    // Check for duplicate partIds
    const partIds = new Set<string>();
    validItems.forEach((item, index) => {
      if (partIds.has(item.partId)) {
        invalidItems.push({
          data: item,
          errors: [`Duplicate partId: ${item.partId}`],
        });
        validItems.splice(index, 1);
      } else {
        partIds.add(item.partId);
      }
    });

    return {
      valid: invalidItems.length === 0,
      validItems,
      invalidItems,
    };
  }
}
