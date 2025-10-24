// Express API Server for MediVerse

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
// Import from parent directory's generated client
// import { dialogflow } from "../../src/lib/gcp/dialogflow";
// import { textToSpeech } from "../../src/lib/gcp/text-to-speech";
// import { ontologyMapper } from "../../src/lib/anatomy/ontology-mapper";
import type { AnatomySystem } from "../../src/types/anatomy";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Moodle Token Generation Endpoints
app.post("/api/moodle/token", async (req, res) => {
  try {
    console.log("🔄 Generating Moodle API token...");

    // Get admin credentials from environment
    const adminUsername = process.env.MOODLE_ADMIN_USERNAME || "admin";
    const adminPassword = process.env.MOODLE_ADMIN_PASSWORD || "admin123!";
    const moodleUrl = process.env.MOODLE_URL || "http://localhost:8081";

    console.log("📋 Using credentials:", {
      username: adminUsername,
      moodleUrl,
      hasPassword: !!adminPassword,
    });

    // Method 1: Try direct token generation via Moodle REST API
    try {
      const tokenResponse = await fetch(`${moodleUrl}/login/token.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: adminUsername,
          password: adminPassword,
          service: "mediverse_api",
        }),
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();

        if (tokenData.token) {
          console.log("✅ Token generated successfully via REST API");
          return res.json({
            token: tokenData.token,
            method: "rest_api",
          });
        } else {
          console.log("⚠️ REST API failed:", tokenData.error);
        }
      }
    } catch (restError) {
      console.log("⚠️ REST API method failed:", restError);
    }

    // Method 1.5: Try without service parameter
    try {
      const tokenResponse = await fetch(`${moodleUrl}/login/token.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();

        if (tokenData.token) {
          console.log(
            "✅ Token generated successfully via REST API (no service)"
          );
          return res.json({
            token: tokenData.token,
            method: "rest_api_no_service",
          });
        } else {
          console.log("⚠️ REST API (no service) failed:", tokenData.error);
        }
      }
    } catch (restError) {
      console.log("⚠️ REST API (no service) method failed:", restError);
    }

    // Method 2: Try web service token generation
    try {
      const wsTokenResponse = await fetch(
        `${moodleUrl}/webservice/rest/server.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            wsfunction: "core_user_create_user_key",
            username: adminUsername,
            password: adminPassword,
            service: "mediverse_api",
            wstoken: "placeholder", // This might work for admin
          }),
        }
      );

      if (wsTokenResponse.ok) {
        const wsData = await wsTokenResponse.json();
        if (wsData.key) {
          console.log("✅ Token generated successfully via Web Service");
          return res.json({
            token: wsData.key,
            method: "web_service",
          });
        }
      }
    } catch (wsError) {
      console.log("⚠️ Web Service method failed:", wsError);
    }

    // Method 3: If all methods fail, return error
    console.log("❌ All token generation methods failed");
    res.status(500).json({
      error: "Failed to generate Moodle API token",
      details:
        "Moodle is not accessible or not properly configured. Please ensure Moodle is running and admin credentials are correct.",
    });
  } catch (error) {
    console.error("❌ Token generation error:", error);
    res.status(500).json({
      error: "Failed to generate Moodle token",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Moodle Health Check
app.get("/api/moodle/health", async (req, res) => {
  try {
    const moodleUrl = process.env.MOODLE_URL || "http://localhost:8081";

    // Check if Moodle is accessible
    const healthResponse = await fetch(`${moodleUrl}/`, {
      method: "GET",
      timeout: 5000,
    });

    if (healthResponse.ok) {
      res.json({
        status: "healthy",
        moodleUrl,
        accessible: true,
      });
    } else {
      res.status(503).json({
        status: "unhealthy",
        moodleUrl,
        accessible: false,
        statusCode: healthResponse.status,
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Anatomy Parts Endpoints
app.get("/api/anatomy/parts", async (req, res) => {
  try {
    const { system } = req.query;

    const parts = await prisma.anatomyPart.findMany({
      where: system ? { system: system as AnatomySystem } : undefined,
      include: {
        synonyms: true,
      },
    });

    res.json(parts);
  } catch (error) {
    console.error("Error fetching parts:", error);
    res.status(500).json({ error: "Failed to fetch anatomy parts" });
  }
});

app.get("/api/anatomy/search", async (req, res) => {
  try {
    const { q, limit = "10" } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query parameter required" });
    }

    const parts = await prisma.anatomyPart.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { latinName: { contains: q, mode: "insensitive" } },
          {
            synonyms: {
              some: {
                synonym: { contains: q, mode: "insensitive" },
              },
            },
          },
        ],
      },
      take: parseInt(limit as string),
      include: {
        synonyms: true,
      },
    });

    res.json(parts);
  } catch (error) {
    console.error("Error searching parts:", error);
    res.status(500).json({ error: "Failed to search anatomy parts" });
  }
});

app.get("/api/anatomy/parts/:partId", async (req, res) => {
  try {
    const { partId } = req.params;

    const part = await prisma.anatomyPart.findUnique({
      where: { partId },
      include: {
        synonyms: true,
        parent: true,
        children: true,
      },
    });

    if (!part) {
      return res.status(404).json({ error: "Part not found" });
    }

    res.json(part);
  } catch (error) {
    console.error("Error fetching part:", error);
    res.status(500).json({ error: "Failed to fetch anatomy part" });
  }
});

app.get("/api/anatomy/parts/:partId/synonyms", async (req, res) => {
  try {
    const { partId } = req.params;

    const part = await prisma.anatomyPart.findUnique({
      where: { partId },
    });

    if (!part) {
      return res.status(404).json({ error: "Part not found" });
    }

    const synonyms = await prisma.anatomySynonym.findMany({
      where: { partId: part.id },
      orderBy: { priority: "desc" },
    });

    res.json(synonyms);
  } catch (error) {
    console.error("Error fetching synonyms:", error);
    res.status(500).json({ error: "Failed to fetch synonyms" });
  }
});

// Voice Command Endpoints
app.post("/api/voice/process", async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript required" });
    }

    // TODO: Process with Dialogflow
    // const command = await dialogflow.parseVoiceCommand(transcript);

    // Placeholder response for now
    const command = {
      success: true,
      action: "SHOW",
      target: transcript.toLowerCase().includes("heart") ? "heart" : "skeleton",
      transcript,
      confidence: 0.8,
      intent: "anatomy.show",
    };

    // Log command for analytics
    await prisma.voiceCommand.create({
      data: {
        transcript,
        intent: command.intent,
        action: command.action,
        target: command.target,
        confidence: command.confidence,
        success: command.success,
      },
    });

    res.json(command);
  } catch (error) {
    console.error("Error processing voice command:", error);
    res.status(500).json({ error: "Failed to process voice command" });
  }
});

app.post("/api/voice/feedback", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text required" });
    }

    // TODO: Implement GCP Text-to-Speech
    // const audioBuffer = await textToSpeech.synthesize(text);

    // For now, return empty response
    res.status(501).json({ error: "Text-to-Speech not implemented yet" });
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Failed to generate voice feedback" });
  }
});

// Session Endpoints
app.post("/api/sessions", async (req, res) => {
  try {
    const { title, teacherId } = req.body;

    if (!title || !teacherId) {
      return res.status(400).json({
        success: false,
        error: "Title and teacherId required",
      });
    }

    const code = generateSessionCode();

    const session = await prisma.teachingSession.create({
      data: {
        code,
        title,
        teacherId,
        isActive: true,
        cameraPosition: JSON.stringify({ x: 0, y: 5, z: 10 }),
        modelRotation: JSON.stringify({ x: 0, y: 0, z: 0 }),
        visibleSystems: ["SKELETAL"],
      },
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create session",
    });
  }
});

app.get("/api/sessions/active", async (req, res) => {
  try {
    console.log("Starting sessions/active request");
    console.log("Prisma client:", typeof prisma);

    const sessions = await prisma.teachingSession.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log("Sessions found:", sessions.length);
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      name: error instanceof Error ? error.name : "Unknown error type",
    });
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});

app.get("/api/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.teachingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

app.post("/api/sessions/join", async (req, res) => {
  try {
    const { code, studentId } = req.body;

    if (!code || !studentId) {
      return res.status(400).json({ error: "Code and studentId required" });
    }

    const session = await prisma.teachingSession.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session || !session.isActive) {
      return res.status(404).json({ error: "Session not found or inactive" });
    }

    await prisma.sessionStudent.upsert({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId,
        },
      },
      create: {
        sessionId: session.id,
        studentId,
      },
      update: {},
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error joining session:", error);
    res.status(500).json({ error: "Failed to join session" });
  }
});

app.patch("/api/sessions/:sessionId/state", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { viewerState } = req.body;

    const session = await prisma.teachingSession.update({
      where: { id: sessionId },
      data: {
        highlightedPart: viewerState.highlightedPart,
        cameraPosition: viewerState.cameraPosition
          ? JSON.stringify(viewerState.cameraPosition)
          : undefined,
        modelRotation: viewerState.modelRotation
          ? JSON.stringify(viewerState.modelRotation)
          : undefined,
        visibleSystems: viewerState.visibleSystems || [],
        slicePosition: viewerState.slicePosition
          ? JSON.stringify(viewerState.slicePosition)
          : undefined,
      },
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ error: "Failed to update session" });
  }
});

app.post("/api/sessions/:sessionId/end", async (req, res) => {
  try {
    const { sessionId } = req.params;

    await prisma.teachingSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

app.get("/api/sessions/:sessionId/analytics", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [session, students, commands] = await Promise.all([
      prisma.teachingSession.findUnique({
        where: { id: sessionId },
      }),
      prisma.sessionStudent.count({
        where: { sessionId },
      }),
      prisma.voiceCommand.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const analytics = {
      session,
      totalStudents: students,
      totalCommands: commands.length,
      successRate:
        commands.length > 0
          ? commands.filter((c) => c.success).length / commands.length
          : 0,
      commandHistory: commands,
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Helper functions
function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Start server
app.listen(PORT, async () => {
  // TODO: Initialize ontology mapper when implemented
  // await initializeOntology();
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
