#!/usr/bin/env python3
"""
Export main Z-Anatomy systems to GLB
Usage: blender --background public/models/Z-Anatomy/Startup.blend --python scripts/export-z-anatomy-main-systems.py
"""

import bpy
import os

# Output directory
OUTPUT_DIR = os.path.abspath("public/models")

def export_collection_to_glb(collection_name, output_path, decimate_ratio=None):
    """Export a specific collection to GLB"""
    try:
        # Deselect all
        bpy.ops.object.select_all(action='DESELECT')
        
        # Select all objects in collection
        if collection_name in bpy.data.collections:
            collection = bpy.data.collections[collection_name]
            
            # Count meshes
            mesh_count = sum(1 for obj in collection.objects if obj.type == 'MESH')
            if mesh_count == 0:
                print(f"⚠️  Skipping {collection_name}: No meshes found")
                return False
            
            for obj in collection.objects:
                if obj.type == 'MESH':
                    obj.select_set(True)
            
            # Apply decimation if requested (for LOD)
            if decimate_ratio and decimate_ratio < 1.0:
                for obj in bpy.context.selected_objects:
                    if obj.type == 'MESH':
                        mod = obj.modifiers.new(name='Decimate', type='DECIMATE')
                        mod.ratio = decimate_ratio
                        bpy.context.view_layer.objects.active = obj
                        bpy.ops.object.modifier_apply(modifier='Decimate')
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Export selected to GLB
            bpy.ops.export_scene.gltf(
                filepath=output_path,
                use_selection=True,
                export_format='GLB',
                export_draco_mesh_compression_enable=True,
                export_draco_mesh_compression_level=6,
                export_apply=True,
                export_yup=True
            )
            
            file_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            print(f"✅ Exported: {output_path} ({file_size:.1f} MB, {mesh_count} meshes)")
            
            # Deselect all
            bpy.ops.object.select_all(action='DESELECT')
            
            return True
        else:
            print(f"❌ Collection not found: {collection_name}")
            return False
    except Exception as e:
        print(f"❌ Error exporting {collection_name}: {e}")
        return False

def main():
    print("\n🎨 Exporting Z-Anatomy Main Systems to GLB")
    print("=" * 70)
    
    # Main anatomical systems with their collection names
    systems = [
        # (collection_name, output_directory, output_filename)
        ("1: Skeletal system", "skeleton", "skeleton-full"),
        ("4: Muscular system", "muscular", "muscles-full"),
        ("5: Cardiovascular system", "cardiovascular", "cardiovascular-full"),
        ("7: Nervous system & Sense organs", "nervous", "nervous-full"),
        ("8: Visceral systems", "respiratory", "visceral-full"),
    ]
    
    # Export high-quality versions
    print("\n📦 Exporting HIGH quality versions...")
    for collection_name, output_dir, filename in systems:
        output_path = f"{OUTPUT_DIR}/{output_dir}/{filename}.glb"
        export_collection_to_glb(collection_name, output_path)
    
    # Export medium-quality LOD versions
    print("\n📦 Exporting MEDIUM quality LOD versions...")
    for collection_name, output_dir, filename in systems:
        output_path = f"{OUTPUT_DIR}/{output_dir}/{filename}-med.glb"
        export_collection_to_glb(collection_name, output_path, decimate_ratio=0.5)
    
    # Export low-quality LOD versions
    print("\n📦 Exporting LOW quality LOD versions...")
    for collection_name, output_dir, filename in systems:
        output_path = f"{OUTPUT_DIR}/{output_dir}/{filename}-low.glb"
        export_collection_to_glb(collection_name, output_path, decimate_ratio=0.2)
    
    # Export some specific organs
    print("\n📦 Exporting specific organs...")
    
    specific_parts = [
        # From the inspection, we know these exist
        ("Left lung", "respiratory", "lung-left"),
        ("Right lung", "respiratory", "lung-right"),
    ]
    
    for obj_name, output_dir, filename in specific_parts:
        bpy.ops.object.select_all(action='DESELECT')
        if obj_name in bpy.data.objects:
            obj = bpy.data.objects[obj_name]
            if obj.type == 'MESH':
                obj.select_set(True)
                output_path = f"{OUTPUT_DIR}/{output_dir}/{filename}.glb"
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                
                bpy.ops.export_scene.gltf(
                    filepath=output_path,
                    use_selection=True,
                    export_format='GLB',
                    export_draco_mesh_compression_enable=True,
                    export_draco_mesh_compression_level=6,
                    export_apply=True,
                    export_yup=True
                )
                
                file_size = os.path.getsize(output_path) / (1024 * 1024)
                print(f"✅ Exported: {output_path} ({file_size:.1f} MB)")
    
    print("\n" + "=" * 70)
    print("✨ Export complete!")
    print("\n📁 Models saved to: public/models/")
    print("\n💡 Next steps:")
    print("1. Check the exported files: ls -lh public/models/*/")
    print("2. Test in the app: npm run dev")
    print("3. Update seed script with actual model paths")

if __name__ == "__main__":
    main()

