import {
  IPartIdentificationManager,
  PartIdentificationChallenge,
} from "./types";
import { prisma } from "@/lib/db";
import { IOntologyService } from "../command/types";

export class PartIdentificationManager implements IPartIdentificationManager {
  constructor(private ontologyService: IOntologyService) {}

  async createChallenge(
    challenge: Partial<PartIdentificationChallenge>
  ): Promise<string> {
    // Validate all parts exist and belong to the specified system
    for (const partId of challenge.parts || []) {
      const isValid = await this.ontologyService.validateAnatomyPart(partId);
      if (!isValid) {
        throw new Error(`Invalid part ID: ${partId}`);
      }

      const system = await this.ontologyService.getSystemForPart(partId);
      if (system !== challenge.systemId) {
        throw new Error(
          `Part ${partId} does not belong to system ${challenge.systemId}`
        );
      }
    }

    const createdChallenge = await prisma.partIdentificationChallenge.create({
      data: {
        ...challenge,
        id: undefined,
        createdAt: new Date(),
      },
    });

    return createdChallenge.id;
  }

  async startChallenge(
    challengeId: string,
    studentId: string
  ): Promise<string> {
    // Check if student already has an active attempt
    const existingAttempt = await prisma.challengeAttempt.findFirst({
      where: {
        challengeId,
        studentId,
        completedAt: null,
      },
    });

    if (existingAttempt) {
      return existingAttempt.id;
    }

    // Create new attempt
    const attempt = await prisma.challengeAttempt.create({
      data: {
        challengeId,
        studentId,
        startedAt: new Date(),
        identifications: [],
      },
    });

    return attempt.id;
  }

  async submitIdentification(
    attemptId: string,
    partId: string,
    answer: string
  ): Promise<boolean> {
    // Resolve the answered part name
    const resolvedPartId = await this.ontologyService.resolveAnatomyPart(
      answer
    );

    // Check if the answer is correct
    const isCorrect = resolvedPartId === partId;

    // Save the identification
    await prisma.partIdentification.create({
      data: {
        attemptId,
        partId,
        answer,
        resolvedPartId,
        isCorrect,
        timestamp: new Date(),
      },
    });

    return isCorrect;
  }

  async getChallengeResults(challengeId: string): Promise<any[]> {
    const attempts = await prisma.challengeAttempt.findMany({
      where: {
        challengeId,
        completedAt: { not: null },
      },
      include: {
        identifications: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Calculate statistics for each attempt
    return attempts.map((attempt) => {
      const totalParts = attempt.identifications.length;
      const correctIdentifications = attempt.identifications.filter(
        (i) => i.isCorrect
      ).length;
      const accuracy = totalParts > 0 ? correctIdentifications / totalParts : 0;
      const timeSpent =
        attempt.completedAt &&
        (attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000;

      return {
        attemptId: attempt.id,
        student: attempt.student,
        accuracy: accuracy * 100,
        correctIdentifications,
        totalParts,
        timeSpent,
        completedAt: attempt.completedAt,
      };
    });
  }
}
