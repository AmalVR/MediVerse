#!/usr/bin/env python3
"""
Extract Z-Anatomy part names and build ontology for database
Usage: blender --background public/models/Z-Anatomy/Startup.blend --python scripts/extract-z-anatomy-ontology.py
"""

import bpy
import json
import re

def normalize_part_id(name):
    """Convert Z-Anatomy name to database partId format"""
    # Remove special characters and convert to lowercase
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    # Replace spaces and hyphens with underscores
    normalized = re.sub(r'[-\s]+', '_', normalized)
    # Remove leading/trailing underscores
    normalized = normalized.strip('_')
    return normalized

def determine_system(collection_name, object_name):
    """Determine anatomical system from collection/object name"""
    name_lower = f"{collection_name} {object_name}".lower()
    
    if any(kw in name_lower for kw in ['skeleton', 'bone', 'skull', 'vertebra', 'rib', 'femur']):
        return 'SKELETAL'
    elif any(kw in name_lower for kw in ['muscle', 'muscular']):
        return 'MUSCULAR'
    elif any(kw in name_lower for kw in ['nerve', 'nervous', 'brain', 'spinal']):
        return 'NERVOUS'
    elif any(kw in name_lower for kw in ['heart', 'cardiac', 'artery', 'vein', 'blood']):
        return 'CARDIOVASCULAR'
    elif any(kw in name_lower for kw in ['lung', 'respiratory', 'trachea', 'bronch']):
        return 'RESPIRATORY'
    elif any(kw in name_lower for kw in ['stomach', 'intestin', 'digestive', 'liver', 'pancrea']):
        return 'DIGESTIVE'
    elif any(kw in name_lower for kw in ['kidney', 'bladder', 'urinary', 'ureter']):
        return 'URINARY'
    elif any(kw in name_lower for kw in ['lymph', 'spleen', 'thymus']):
        return 'LYMPHATIC'
    elif any(kw in name_lower for kw in ['skin', 'integument', 'hair']):
        return 'INTEGUMENTARY'
    else:
        return 'SKELETAL'  # Default

def extract_ontology():
    """Extract anatomy parts ontology from Z-Anatomy"""
    
    ontology = []
    processed_names = set()
    
    print("\n🔍 Extracting Z-Anatomy Ontology")
    print("=" * 70)
    
    # Process main system collections
    main_collections = [
        "1: Skeletal system",
        "4: Muscular system",
        "5: Cardiovascular system",
        "7: Nervous system & Sense organs",
        "8: Visceral systems",
    ]
    
    for collection_name in main_collections:
        if collection_name not in bpy.data.collections:
            continue
            
        collection = bpy.data.collections[collection_name]
        system = determine_system(collection_name, "")
        
        print(f"\n📦 Processing: {collection_name} ({system})")
        
        # Process meshes in collection
        for obj in collection.objects:
            if obj.type != 'MESH' or not obj.name:
                continue
                
            # Skip duplicate names
            if obj.name in processed_names:
                continue
                
            processed_names.add(obj.name)
            
            # Create part entry
            part_id = normalize_part_id(obj.name)
            
            # Generate synonyms
            synonyms = [
                {"synonym": obj.name.lower(), "language": "en", "priority": 10}
            ]
            
            # Add common English synonyms
            if "left" in obj.name.lower():
                synonyms.append({
                    "synonym": obj.name.lower().replace("left", "l").replace(".l", ""),
                    "language": "en",
                    "priority": 8
                })
            elif "right" in obj.name.lower():
                synonyms.append({
                    "synonym": obj.name.lower().replace("right", "r").replace(".r", ""),
                    "language": "en",
                    "priority": 8
                })
            
            # Determine model path based on system
            system_paths = {
                'SKELETAL': 'skeleton/skeleton-full.glb',
                'MUSCULAR': 'muscular/muscles-full.glb',
                'CARDIOVASCULAR': 'cardiovascular/cardiovascular-full.glb',
                'NERVOUS': 'nervous/nervous-full.glb',
                'RESPIRATORY': 'respiratory/visceral-full.glb',
                'DIGESTIVE': 'respiratory/visceral-full.glb',
            }
            
            part_entry = {
                "partId": part_id,
                "name": obj.name,
                "system": system,
                "modelPath": f"/models/{system_paths.get(system, 'skeleton/skeleton-full.glb')}",
                "meshName": obj.name,  # Store original mesh name for raycasting
                "synonyms": synonyms
            }
            
            ontology.append(part_entry)
            
            if len(processed_names) % 100 == 0:
                print(f"  Processed {len(processed_names)} parts...")
    
    print(f"\n✅ Extracted {len(ontology)} anatomy parts")
    
    # Save ontology to JSON
    output_path = "../data/z-anatomy-ontology.json"
    with open(output_path, 'w') as f:
        json.dump(ontology, f, indent=2)
    
    print(f"💾 Ontology saved to: {output_path}")
    
    # Generate TypeScript seeding data
    output_ts_path = "../data/z-anatomy-ontology.ts"
    with open(output_ts_path, 'w') as f:
        f.write("// Auto-generated Z-Anatomy ontology\n")
        f.write("// Generated from Z-Anatomy Blender file\n\n")
        f.write("import { AnatomySystem } from '../src/types/anatomy';\n\n")
        f.write("export const zAnatomyOntology = ")
        f.write(json.dumps(ontology, indent=2))
        f.write(";\n")
    
    print(f"💾 TypeScript data saved to: {output_ts_path}")
    
    # Print statistics
    systems = {}
    for part in ontology:
        sys = part['system']
        systems[sys] = systems.get(sys, 0) + 1
    
    print("\n📊 Parts by system:")
    for system, count in sorted(systems.items()):
        print(f"  {system}: {count} parts")

if __name__ == "__main__":
    extract_ontology()

