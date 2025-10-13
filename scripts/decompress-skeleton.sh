#!/bin/bash

# Quick script to decompress skeleton model without DRACO
# This fixes the "No DRACOLoader instance provided" error

echo "🔧 Decompressing Skeleton Model"
echo "================================"
echo ""

# Check if gltf-pipeline is installed
if ! command -v gltf-pipeline &> /dev/null; then
    echo "📦 Installing gltf-pipeline globally..."
    npm install -g gltf-pipeline
fi

cd "$(dirname "$0")/.."

SKELETON_IN="public/models/skeleton/skeleton-full.glb"
SKELETON_OUT="public/models/skeleton/skeleton-uncompressed.glb"

if [ ! -f "$SKELETON_IN" ]; then
    echo "❌ Error: $SKELETON_IN not found"
    exit 1
fi

echo "📥 Input: $SKELETON_IN"
echo "📤 Output: $SKELETON_OUT"
echo ""
echo "⏳ Decompressing... (this may take a minute)"

gltf-pipeline -i "$SKELETON_IN" -o "$SKELETON_OUT"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Skeleton model decompressed"
    echo ""
    echo "📊 File sizes:"
    ls -lh "$SKELETON_IN" | awk '{print "   Original (DRACO): " $5}'
    ls -lh "$SKELETON_OUT" | awk '{print "   Uncompressed:     " $5}'
    echo ""
    echo "🔧 To use the new model:"
    echo "   1. Update AnatomyViewer.tsx:"
    echo "      modelPath=\"/models/skeleton/skeleton-uncompressed.glb\""
    echo ""
    echo "   OR"
    echo ""
    echo "   2. Replace the original file:"
    echo "      mv $SKELETON_OUT $SKELETON_IN"
    echo ""
else
    echo ""
    echo "❌ Failed to decompress"
    echo ""
    echo "💡 Alternative: Re-export from Blender without DRACO"
    echo "   See: WASM_MEMORY_FIX.md"
fi

