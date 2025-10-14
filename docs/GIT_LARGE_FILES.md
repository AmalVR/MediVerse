# Managing Large Files in MediVerse

## Issue: GitHub File Size Limits

GitHub rejects files larger than 100MB. Our project contains:

- ❌ Blender source files (`.blend`, `.blend1`) - 290+ MB
- ❌ Unity WebGL data files (`.data.unityweb`) - 182 MB
- ✅ Exported GLB models - Usually under 50 MB

## Solution Applied

### 1. Updated `.gitignore`

Added rules to exclude large files:

```gitignore
# 3D Models - Source files (too large for GitHub)
public/models/**/*.blend
public/models/**/*.blend1
public/models/**/*.blend2
public/models/Z-Anatomy/

# Unity Builds (large files)
public/unity/**/Build/*.data.unityweb
public/unity/**/Build/*.wasm.unityweb
```

### 2. Removed Files from Git History

Large files in previous commits block pushes. Used `git filter-branch`:

```bash
# Remove specific files from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch \
    public/models/Z-Anatomy/Startup.blend \
    public/models/Z-Anatomy/Startup.blend1" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up backup refs
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (first time only)
git push -u origin main --force
```

### Result:

- **Before:** 600+ MB repository
- **After:** 12 MB repository ✅

## Best Practices

### ✅ DO Commit:

- Source code (`.ts`, `.tsx`, `.js`)
- Configuration files (`.json`, `.config.ts`)
- Documentation (`.md`)
- Small assets (<10 MB)
- Exported GLB models (if <50 MB)

### ❌ DON'T Commit:

- **Blender source files** - Too large, not needed for runtime
- **Unity builds** - Rebuild from Unity project
- **Large datasets** - Use external storage
- **node_modules** - Install via npm
- **Build artifacts** - Generated files

## Alternatives for Large Files

### 1. Git LFS (Git Large File Storage)

For files that MUST be versioned:

```bash
# Install Git LFS
brew install git-lfs  # macOS
git lfs install

# Track large file types
git lfs track "*.blend"
git lfs track "*.unityweb"

# Commit .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS"
```

**Limits:**

- GitHub Free: 1 GB storage, 1 GB bandwidth/month
- GitHub Pro: 50 GB storage, 50 GB bandwidth/month

### 2. External Storage

For files that don't need versioning:

**Cloud Storage:**

- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Cloudinary (for assets)

**Download on Setup:**

```bash
# In setup script
curl -O https://storage.example.com/models/anatomy-full.glb
```

### 3. Separate Repository

For model files:

```bash
# Create separate repo for models
git clone https://github.com/YourOrg/mediverse-models.git
mv mediverse-models/ public/models/
```

## Current File Structure

### Excluded from Git:

```
public/
├── models/
│   └── Z-Anatomy/          ❌ Blender files (ignored)
│       ├── Startup.blend
│       └── Startup.blend1
└── unity/
    └── pc-build/Build/
        └── *.unityweb      ❌ Large Unity data (ignored)
```

### Included in Git:

```
public/
├── models/
│   ├── skeleton/
│   │   └── skeleton.glb    ✅ Exported model
│   ├── cardiovascular/
│   │   └── heart.glb       ✅ Exported model
│   └── ...
└── unity/
    └── pc-build/
        ├── index.html      ✅ Unity HTML
        └── Build/
            ├── *.loader.js ✅ Small files
            └── *.framework.js.unityweb ✅ Framework (<1MB)
```

## Checking File Sizes

### Before Committing:

```bash
# Find files over 50MB
find . -type f -size +50M -not -path "*/node_modules/*" -not -path "*/.git/*"

# Check specific directory
du -sh public/models/*

# Check if file is ignored
git check-ignore public/models/Z-Anatomy/Startup.blend
```

### Repository Size:

```bash
# Check .git folder size
du -sh .git

# List largest files in git
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 --reverse | \
  head -20
```

## Recovery from Push Failure

If you accidentally commit large files:

### Quick Fix (Before First Push):

```bash
# Remove from staging
git rm --cached path/to/large-file

# Commit removal
git commit -m "Remove large file"

# Push
git push
```

### Nuclear Option (Already Pushed):

```bash
# ⚠️ Rewrites history - coordinate with team!

# Remove from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/large-file" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (destructive!)
git push origin main --force
```

## Team Workflow

### Setup Script (developers):

```bash
#!/bin/bash
# setup-models.sh

echo "📦 Setting up large model files..."

# Option 1: Download from cloud
curl -o public/models/Z-Anatomy/Startup.blend \
  https://your-storage.com/models/Startup.blend

# Option 2: Git LFS pull
git lfs pull

# Option 3: Manual instruction
echo "⚠️  Please download Z-Anatomy models manually:"
echo "https://drive.google.com/your-shared-folder"
```

### Documentation:

Always update `README.md` with:

- Where to get large files
- How to set them up locally
- Why they're not in git

## Summary

✅ **Fixed:** Removed 600+ MB of large files  
✅ **Protected:** Updated .gitignore  
✅ **Optimized:** Repository now 12 MB  
✅ **Documented:** This guide for future reference

**Rule of Thumb:** If a file is >10 MB, think twice before committing!
