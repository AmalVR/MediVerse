// WebSocket Server for Real-time Session Sync

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../.env") });

import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { PrismaClient } from "@prisma/client";
import type { WSMessage, WSMessageType } from "../../src/types/anatomy";

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:8082",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const prisma = new PrismaClient();
const PORT = process.env.WS_PORT || 3001;

// Room management
const sessionRooms = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  const { sessionId, userId, role } = socket.handshake.auth;

  console.log(
    `📡 Client connected: ${socket.id} (${role}) to session ${sessionId}`
  );

  if (!sessionId || !userId || !role) {
    socket.disconnect();
    return;
  }

  // Join session room
  socket.join(`session:${sessionId}`);

  // Track users in room
  if (!sessionRooms.has(sessionId)) {
    sessionRooms.set(sessionId, new Set());
  }
  sessionRooms.get(sessionId)!.add(socket.id);

  // Notify others of new student
  if (role === "student") {
    socket.to(`session:${sessionId}`).emit("message", {
      type: "STUDENT_JOINED",
      sessionId,
      data: { studentId: userId },
      timestamp: Date.now(),
    } as WSMessage);
  }

  // Handle incoming messages
  socket.on("message", async (message: WSMessage) => {
    console.log(`📨 Message from ${socket.id}:`, message.type);

    try {
      switch (message.type) {
        case "VIEWER_STATE_CHANGE":
          // Teacher updates viewer state
          if (role === "teacher") {
            await handleViewerStateChange(message);
            // Broadcast to all students in session
            socket.to(`session:${sessionId}`).emit("message", message);
          }
          break;

        case "COMMAND_EXECUTED":
          // Log command execution
          await handleCommandExecuted(message);
          socket.to(`session:${sessionId}`).emit("message", message);
          break;

        case "SESSION_UPDATE":
          // General session updates
          socket.to(`session:${sessionId}`).emit("message", message);
          break;

        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("error", {
        message: "Failed to process message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`📡 Client disconnected: ${socket.id}`);

    const room = sessionRooms.get(sessionId);
    if (room) {
      room.delete(socket.id);

      if (room.size === 0) {
        sessionRooms.delete(sessionId);
      }
    }

    // Notify others of student leaving
    if (role === "student") {
      socket.to(`session:${sessionId}`).emit("message", {
        type: "STUDENT_LEFT",
        sessionId,
        data: { studentId: userId },
        timestamp: Date.now(),
      } as WSMessage);
    }
  });

  // Send current room info
  socket.emit("room-info", {
    sessionId,
    connectedUsers: sessionRooms.get(sessionId)?.size || 0,
  });
});

// Message Handlers
async function handleViewerStateChange(message: WSMessage) {
  const { sessionId, data } = message;

  await prisma.teachingSession.update({
    where: { id: sessionId },
    data: {
      highlightedPart: data.highlightedPart,
      cameraPosition: data.cameraPosition,
      modelRotation: data.modelRotation,
      visibleSystems: data.visibleSystems,
      slicePosition: data.slicePosition,
    },
  });
}

async function handleCommandExecuted(message: WSMessage) {
  const { sessionId, data } = message;

  await prisma.voiceCommand.create({
    data: {
      sessionId,
      transcript: data.transcript,
      intent: data.intent,
      action: data.action,
      target: data.target,
      confidence: data.confidence,
      success: data.success,
      errorMsg: data.errorMsg,
    },
  });
}

// Broadcast to specific session
export function broadcastToSession(sessionId: string, message: WSMessage) {
  io.to(`session:${sessionId}`).emit("message", message);
}

// Get active sessions
export function getActiveSessions(): string[] {
  return Array.from(sessionRooms.keys());
}

// Start WebSocket server
httpServer.listen(PORT, () => {
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  io.close();
  await prisma.$disconnect();
  process.exit(0);
});
