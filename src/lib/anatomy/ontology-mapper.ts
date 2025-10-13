// Anatomy Ontology Mapper - Maps voice commands to anatomy part IDs

import type {
  AnatomyPart,
  AnatomySynonym,
  AnatomySystem,
} from "@/types/anatomy";

interface OntologyData {
  parts: Map<string, AnatomyPart>;
  synonyms: Map<string, string>; // synonym -> partId
  systemParts: Map<AnatomySystem, string[]>; // system -> partIds
}

export class AnatomyOntologyMapper {
  private data: OntologyData = {
    parts: new Map(),
    synonyms: new Map(),
    systemParts: new Map(),
  };

  /**
   * Initialize with anatomy data from database
   */
  async initialize(parts: AnatomyPart[], synonyms: AnatomySynonym[]) {
    // Index parts
    parts.forEach((part) => {
      this.data.parts.set(part.partId, part);

      // Index by system
      if (!this.data.systemParts.has(part.system)) {
        this.data.systemParts.set(part.system, []);
      }
      this.data.systemParts.get(part.system)!.push(part.partId);
    });

    // Index synonyms
    synonyms.forEach((syn) => {
      const key = syn.synonym.toLowerCase();

      // If multiple synonyms exist, prioritize higher priority
      const existing = this.data.synonyms.get(key);
      if (existing) {
        const existingSyn = synonyms.find(
          (s) => s.partId === existing && s.synonym.toLowerCase() === key
        );
        if (existingSyn && syn.priority > existingSyn.priority) {
          this.data.synonyms.set(key, syn.partId);
        }
      } else {
        this.data.synonyms.set(key, syn.partId);
      }
    });

    console.log(
      `Loaded ${parts.length} anatomy parts, ${synonyms.length} synonyms`
    );
  }

  /**
   * Map natural language term to anatomy part ID
   */
  mapToPartId(term: string): string | null {
    const normalized = term.toLowerCase().trim();

    // Try direct synonym match
    const partId = this.data.synonyms.get(normalized);
    if (partId) return partId;

    // Try fuzzy matching with Levenshtein distance
    const matches = this.fuzzyMatch(normalized);
    return matches.length > 0 ? matches[0].partId : null;
  }

  /**
   * Get anatomy part by ID
   */
  getPartById(partId: string): AnatomyPart | null {
    return this.data.parts.get(partId) || null;
  }

  /**
   * Get all parts in a system
   */
  getPartsBySystem(system: AnatomySystem): AnatomyPart[] {
    const partIds = this.data.systemParts.get(system) || [];
    return partIds
      .map((id) => this.data.parts.get(id))
      .filter((part): part is AnatomyPart => part !== undefined);
  }

  /**
   * Get parent-child hierarchy
   */
  getHierarchy(partId: string): AnatomyPart[] {
    const hierarchy: AnatomyPart[] = [];
    let current = this.data.parts.get(partId);

    while (current) {
      hierarchy.unshift(current);
      current = current.parentId
        ? this.data.parts.get(current.parentId)
        : undefined;
    }

    return hierarchy;
  }

  /**
   * Get children of a part
   */
  getChildren(partId: string): AnatomyPart[] {
    return Array.from(this.data.parts.values()).filter(
      (part) => part.parentId === partId
    );
  }

  /**
   * Fuzzy matching with Levenshtein distance
   */
  private fuzzyMatch(
    term: string,
    threshold = 3
  ): Array<{ partId: string; distance: number }> {
    const matches: Array<{ partId: string; distance: number }> = [];

    this.data.synonyms.forEach((partId, synonym) => {
      const distance = this.levenshteinDistance(term, synonym);
      if (distance <= threshold) {
        matches.push({ partId, distance });
      }
    });

    // Sort by distance (closest first)
    return matches.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Search parts by name (for autocomplete)
   */
  search(query: string, limit = 10): AnatomyPart[] {
    const normalized = query.toLowerCase();
    const results: Array<{ part: AnatomyPart; score: number }> = [];

    this.data.parts.forEach((part) => {
      const name = part.name.toLowerCase();
      const latinName = part.latinName?.toLowerCase() || "";

      // Exact prefix match gets highest score
      if (name.startsWith(normalized)) {
        results.push({ part, score: 100 });
      } else if (latinName.startsWith(normalized)) {
        results.push({ part, score: 90 });
      } else if (name.includes(normalized)) {
        results.push({ part, score: 50 });
      } else if (latinName.includes(normalized)) {
        results.push({ part, score: 40 });
      }
    });

    // Check synonyms
    this.data.synonyms.forEach((partId, synonym) => {
      if (synonym.includes(normalized)) {
        const part = this.data.parts.get(partId);
        if (part && !results.find((r) => r.part.id === part.id)) {
          results.push({ part, score: 30 });
        }
      }
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.part);
  }

  /**
   * Get all systems
   */
  getAllSystems(): AnatomySystem[] {
    return Array.from(this.data.systemParts.keys());
  }
}

export const ontologyMapper = new AnatomyOntologyMapper();
