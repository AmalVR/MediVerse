#!/usr/bin/env python3
"""
Convert Z-Anatomy Blender files to GLB format
Usage: blender --background --python convert-blender-to-glb.py
"""

import bpy
import os
import sys

# Output directory
OUTPUT_DIR = "../public/models"

def export_collection_to_glb(collection_name, output_path):
    """Export a specific collection to GLB"""
    try:
        # Deselect all
        bpy.ops.object.select_all(action='DESELECT')
        
        # Select all objects in collection
        if collection_name in bpy.data.collections:
            collection = bpy.data.collections[collection_name]
            for obj in collection.objects:
                obj.select_set(True)
            
            # Export selected to GLB
            bpy.ops.export_scene.gltf(
                filepath=output_path,
                use_selection=True,
                export_format='GLB',
                export_draco_mesh_compression_enable=True,
                export_draco_mesh_compression_level=6,
                export_apply=True
            )
            print(f"✅ Exported: {output_path}")
            return True
        else:
            print(f"❌ Collection not found: {collection_name}")
            return False
    except Exception as e:
        print(f"❌ Error exporting {collection_name}: {e}")
        return False

def export_object_to_glb(object_name, output_path):
    """Export a specific object to GLB"""
    try:
        # Deselect all
        bpy.ops.object.select_all(action='DESELECT')
        
        # Select object
        if object_name in bpy.data.objects:
            obj = bpy.data.objects[object_name]
            obj.select_set(True)
            
            # Export selected to GLB
            bpy.ops.export_scene.gltf(
                filepath=output_path,
                use_selection=True,
                export_format='GLB',
                export_draco_mesh_compression_enable=True,
                export_draco_mesh_compression_level=6,
                export_apply=True
            )
            print(f"✅ Exported: {output_path}")
            return True
        else:
            print(f"❌ Object not found: {object_name}")
            return False
    except Exception as e:
        print(f"❌ Error exporting {object_name}: {e}")
        return False

def create_lod_version(input_path, output_path, ratio):
    """Create a decimated LOD version"""
    try:
        # Import the GLB
        bpy.ops.import_scene.gltf(filepath=input_path)
        
        # Get imported objects
        imported = [obj for obj in bpy.context.selected_objects if obj.type == 'MESH']
        
        for obj in imported:
            # Add decimate modifier
            mod = obj.modifiers.new(name='Decimate', type='DECIMATE')
            mod.ratio = ratio
            
            # Apply modifier
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.modifier_apply(modifier='Decimate')
        
        # Export decimated version
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            use_selection=True,
            export_format='GLB',
            export_draco_mesh_compression_enable=True,
            export_draco_mesh_compression_level=6
        )
        
        # Clean up
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
        
        print(f"✅ Created LOD: {output_path}")
        return True
    except Exception as e:
        print(f"❌ Error creating LOD: {e}")
        return False

def main():
    print("🎨 Z-Anatomy Blender to GLB Converter")
    print("=" * 50)
    
    # Create output directories
    os.makedirs(f"{OUTPUT_DIR}/skeleton", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/cardiovascular", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/respiratory", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/nervous", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/muscular", exist_ok=True)
    
    # List all collections in the blend file
    print("\n📦 Collections in file:")
    for collection in bpy.data.collections:
        print(f"  - {collection.name}")
    
    print("\n📦 Objects in file:")
    for obj in bpy.data.objects[:10]:  # Show first 10
        print(f"  - {obj.name} ({obj.type})")
    
    # Export examples (adjust based on actual Z-Anatomy structure)
    # You'll need to inspect the Blender file to find the correct collection/object names
    
    # Example exports (uncomment and adjust names as needed):
    
    # Full skeleton
    # export_collection_to_glb('Skeleton', f'{OUTPUT_DIR}/skeleton/skeleton-full.glb')
    
    # Individual bones
    # export_object_to_glb('Skull', f'{OUTPUT_DIR}/skeleton/skull.glb')
    # export_object_to_glb('Femur.L', f'{OUTPUT_DIR}/skeleton/femur-left.glb')
    # export_object_to_glb('Femur.R', f'{OUTPUT_DIR}/skeleton/femur-right.glb')
    
    # Organs
    # export_object_to_glb('Heart', f'{OUTPUT_DIR}/cardiovascular/heart.glb')
    # export_object_to_glb('Lungs', f'{OUTPUT_DIR}/respiratory/lungs.glb')
    
    print("\n✨ Conversion complete!")
    print("\n💡 To export specific parts:")
    print("1. Inspect the Blender file to find collection/object names")
    print("2. Uncomment and adjust the export commands in this script")
    print("3. Run again: blender --background Startup.blend --python convert-blender-to-glb.py")

if __name__ == "__main__":
    main()

