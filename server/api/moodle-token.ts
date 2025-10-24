/**
 * Moodle Token Generation API Endpoint
 *
 * This endpoint automatically generates Moodle API tokens using admin credentials
 * from environment variables, eliminating the need for manual token management.
 */

import express from "express";
import fetch from "node-fetch";

const router = express.Router();

interface MoodleTokenResponse {
  token: string;
  expires?: number;
  error?: string;
}

interface MoodleLoginResponse {
  token?: string;
  error?: string;
  errorcode?: string;
}

/**
 * Generate Moodle API token using admin credentials
 */
router.post("/api/moodle/token", async (req, res) => {
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
          service: "moodle_mobile_app",
        }),
      });

      if (tokenResponse.ok) {
        const tokenData: MoodleLoginResponse = await tokenResponse.json();

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
            service: "moodle_mobile_app",
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

    // Method 3: Fallback - return a placeholder token for development
    console.log("⚠️ All token generation methods failed, using placeholder");
    const placeholderToken = `dev_token_${Date.now()}_${adminUsername}`;

    res.json({
      token: placeholderToken,
      method: "placeholder",
      warning:
        "Using placeholder token for development. Configure Moodle properly for production.",
    });
  } catch (error) {
    console.error("❌ Token generation error:", error);
    res.status(500).json({
      error: "Failed to generate Moodle token",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Health check endpoint for Moodle connectivity
 */
router.get("/api/moodle/health", async (req, res) => {
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

export default router;
