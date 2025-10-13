// SOLID: Single Responsibility Principle
// This class only handles loading Z-Anatomy data

import type { IAnatomyDataProvider, AnatomyPartData } from "../interfaces";
import { AnatomySystem } from "@/types/anatomy";

export class ZAnatomyDataProvider implements IAnatomyDataProvider {
  getSource(): string {
    return "Z-Anatomy Default Dataset";
  }

  async getAnatomyData(): Promise<AnatomyPartData[]> {
    return this.getDefaultAnatomyData();
  }

  private getDefaultAnatomyData(): AnatomyPartData[] {
    return [
      // SKELETAL SYSTEM
      this.createSkeletalSystemParts(),
      // CARDIOVASCULAR SYSTEM
      this.createCardiovascularSystemParts(),
      // RESPIRATORY SYSTEM
      this.createRespiratorySystemParts(),
      // NERVOUS SYSTEM
      this.createNervousSystemParts(),
      // MUSCULAR SYSTEM
      this.createMuscularSystemParts(),
    ].flat();
  }

  private createSkeletalSystemParts(): AnatomyPartData[] {
    return [
      {
        partId: "skeleton",
        name: "Skeleton",
        latinName: "Skeletos",
        system: AnatomySystem.SKELETAL,
        modelPath: "/models/skeleton/skeleton-full.glb",
        lodLevels: {
          low: "/models/skeleton/skeleton-full-low.glb",
          medium: "/models/skeleton/skeleton-full-med.glb",
          high: "/models/skeleton/skeleton-full.glb",
        },
        synonyms: [
          { synonym: "skeleton", language: "en", priority: 10 },
          { synonym: "skeletal system", language: "en", priority: 9 },
          { synonym: "bones", language: "en", priority: 8 },
          { synonym: "esqueleto", language: "es", priority: 9 },
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
          { synonym: "cráneo", language: "es", priority: 9 },
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
    ];
  }

  private createCardiovascularSystemParts(): AnatomyPartData[] {
    return [
      {
        partId: "heart",
        name: "Heart",
        latinName: "Cor",
        system: AnatomySystem.CARDIOVASCULAR,
        modelPath: "/models/cardiovascular/cardiovascular-full.glb",
        lodLevels: {
          low: "/models/cardiovascular/cardiovascular-full-low.glb",
          medium: "/models/cardiovascular/cardiovascular-full-med.glb",
          high: "/models/cardiovascular/cardiovascular-full.glb",
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
    ];
  }

  private createRespiratorySystemParts(): AnatomyPartData[] {
    return [
      {
        partId: "lungs",
        name: "Lungs",
        latinName: "Pulmones",
        system: AnatomySystem.RESPIRATORY,
        modelPath: "/models/respiratory/visceral-full.glb",
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
    ];
  }

  private createNervousSystemParts(): AnatomyPartData[] {
    return [
      {
        partId: "brain",
        name: "Brain",
        latinName: "Cerebrum",
        system: AnatomySystem.NERVOUS,
        modelPath: "/models/nervous/nervous-full.glb",
        synonyms: [
          { synonym: "brain", language: "en", priority: 10 },
          { synonym: "cerebrum", language: "en", priority: 8 },
          { synonym: "cerebro", language: "es", priority: 9 },
          { synonym: "cerveau", language: "fr", priority: 9 },
        ],
      },
    ];
  }

  private createMuscularSystemParts(): AnatomyPartData[] {
    return [
      {
        partId: "biceps_brachii",
        name: "Biceps Brachii",
        latinName: "Musculus Biceps Brachii",
        system: AnatomySystem.MUSCULAR,
        modelPath: "/models/muscular/muscles-full.glb",
        synonyms: [
          { synonym: "biceps", language: "en", priority: 10 },
          { synonym: "biceps brachii", language: "en", priority: 9 },
          { synonym: "arm muscle", language: "en", priority: 5 },
        ],
      },
    ];
  }
}
