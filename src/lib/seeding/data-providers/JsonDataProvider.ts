// SOLID: Open/Closed Principle
// Extensible data provider - can load from JSON files

import type { IAnatomyDataProvider, AnatomyPartData } from "../interfaces";
import fs from "fs/promises";

export class JsonAnatomyDataProvider implements IAnatomyDataProvider {
  constructor(private jsonFilePath: string) {}

  getSource(): string {
    return `JSON file: ${this.jsonFilePath}`;
  }

  async getAnatomyData(): Promise<AnatomyPartData[]> {
    try {
      const content = await fs.readFile(this.jsonFilePath, "utf-8");
      const data = JSON.parse(content);

      if (!Array.isArray(data)) {
        throw new Error("JSON file must contain an array of anatomy parts");
      }

      return data as AnatomyPartData[];
    } catch (error) {
      throw new Error(
        `Failed to load anatomy data from ${this.jsonFilePath}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
