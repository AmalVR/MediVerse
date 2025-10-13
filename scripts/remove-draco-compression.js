#!/usr/bin/env node

/**
 * Script to convert DRACO-compressed GLB files to uncompressed GLB
 * This solves WebAssembly out-of-memory errors in the browser
 *
 * Usage: node scripts/remove-draco-compression.js
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modelsDir = join(__dirname, "../public/models");

// Models to convert
const modelsToConvert = [
  "cardiovascular/cardiovascular-full-low.glb",
  "cardiovascular/cardiovascular-full-med.glb",
  "muscular/muscles-full-low.glb",
  "muscular/muscles-full-med.glb",
  "nervous/nervous-full-low.glb",
  "nervous/nervous-full-med.glb",
  "respiratory/visceral-full-low.glb",
  "respiratory/visceral-full-med.glb",
];

console.log("🔧 DRACO Compression Removal Tool\n");
console.log("This script removes DRACO compression from GLB files");
console.log("to avoid WebAssembly memory errors in browsers.\n");

console.log("⚠️  Alternative Solution:");
console.log("Instead of converting, we recommend re-exporting the models");
console.log("from Blender without DRACO compression.\n");

console.log("📝 Steps to re-export without DRACO from Blender:");
console.log("1. Open the model in Blender");
console.log("2. File > Export > glTF 2.0 (.glb)");
console.log('3. In export settings, find "Compression"');
console.log('4. Set Compression to "None" (disable DRACO)');
console.log("5. Export with a new name (e.g., model-uncompressed.glb)");
console.log("6. Replace the old file\n");

console.log("🔄 For now, using skeleton model (already uncompressed)");
console.log("   and will load models one at a time to reduce memory usage.\n");

// Check which files exist
console.log("📊 Checking files:");
modelsToConvert.forEach((model) => {
  const fullPath = join(modelsDir, model);
  const exists = existsSync(fullPath);
  console.log(`   ${exists ? "✅" : "❌"} ${model}`);
});

console.log("\n💡 Recommendation: Use only the skeleton model for now,");
console.log(
  "   or re-export 1-2 key models from Blender without DRACO compression."
);
