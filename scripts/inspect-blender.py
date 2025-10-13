#!/usr/bin/env python3
"""
Inspect Z-Anatomy Blender file structure
Usage: blender --background Startup.blend --python inspect-blender.py
"""

import bpy
import json

def inspect_blend_file():
    """Inspect the structure of the blend file"""
    
    report = {
        'collections': [],
        'objects': [],
        'meshes': [],
        'materials': []
    }
    
    print("🔍 Inspecting Z-Anatomy Blender File")
    print("=" * 60)
    
    # Collections
    print(f"\n📦 Collections ({len(bpy.data.collections)}):")
    for collection in bpy.data.collections:
        obj_count = len(collection.objects)
        print(f"  📁 {collection.name} ({obj_count} objects)")
        report['collections'].append({
            'name': collection.name,
            'object_count': obj_count
        })
        
        # Show some objects in the collection
        for obj in list(collection.objects)[:3]:
            print(f"     └─ {obj.name} ({obj.type})")
    
    # Objects
    print(f"\n🎯 Objects ({len(bpy.data.objects)}):")
    anatomy_parts = {}
    
    for obj in bpy.data.objects:
        obj_type = obj.type
        
        if obj_type not in anatomy_parts:
            anatomy_parts[obj_type] = []
        
        anatomy_parts[obj_type].append(obj.name)
        
        report['objects'].append({
            'name': obj.name,
            'type': obj_type,
            'location': list(obj.location),
            'collection': obj.users_collection[0].name if obj.users_collection else None
        })
    
    for obj_type, objects in anatomy_parts.items():
        print(f"  {obj_type}: {len(objects)} items")
        for obj_name in objects[:5]:
            print(f"     - {obj_name}")
        if len(objects) > 5:
            print(f"     ... and {len(objects) - 5} more")
    
    # Meshes
    print(f"\n🔺 Meshes ({len(bpy.data.meshes)}):")
    for i, mesh in enumerate(list(bpy.data.meshes)[:10]):
        vertex_count = len(mesh.vertices)
        poly_count = len(mesh.polygons)
        print(f"  - {mesh.name}: {vertex_count} verts, {poly_count} polys")
        report['meshes'].append({
            'name': mesh.name,
            'vertices': vertex_count,
            'polygons': poly_count
        })
    
    if len(bpy.data.meshes) > 10:
        print(f"  ... and {len(bpy.data.meshes) - 10} more meshes")
    
    # Materials
    print(f"\n🎨 Materials ({len(bpy.data.materials)}):")
    for mat in list(bpy.data.materials)[:10]:
        print(f"  - {mat.name}")
        report['materials'].append(mat.name)
    
    if len(bpy.data.materials) > 10:
        print(f"  ... and {len(bpy.data.materials) - 10} more materials")
    
    # Save report
    report_path = '../public/models/z-anatomy-structure.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"\n💾 Full report saved to: {report_path}")
    
    # Suggest exports
    print("\n\n💡 Suggested exports based on structure:")
    print("-" * 60)
    
    # Look for common anatomy terms
    anatomy_keywords = {
        'skeleton': ['skeleton', 'bone', 'skull', 'spine', 'rib', 'femur'],
        'cardiovascular': ['heart', 'cardiac', 'aorta', 'vein', 'artery'],
        'respiratory': ['lung', 'trachea', 'bronch'],
        'nervous': ['brain', 'nerve', 'spinal', 'cerebr'],
        'muscular': ['muscle', 'bicep', 'tricep']
    }
    
    for system, keywords in anatomy_keywords.items():
        print(f"\n{system.upper()}:")
        found = []
        for obj in bpy.data.objects:
            if any(kw in obj.name.lower() for kw in keywords):
                found.append(obj.name)
        
        for obj_name in found[:5]:
            print(f"  export_object_to_glb('{obj_name}', '{system}/{obj_name.lower()}.glb')")
        
        if len(found) > 5:
            print(f"  # ... and {len(found) - 5} more objects")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    inspect_blend_file()

