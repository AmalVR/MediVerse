# Database Architecture

MediVerse uses **ZenStack** with **Prisma** for a type-safe, schema-driven database layer.

## Technology Stack

- **ZenStack** - Enhanced Prisma with built-in access control and validation
- **Prisma** - Type-safe ORM and query builder
- **PostgreSQL** - Production database
- **Zod** - Runtime schema validation (auto-generated from ZenStack)

## Why ZenStack?

ZenStack extends Prisma with:

1. **Access Control** - Built-in authorization rules in schema
2. **Type Safety** - Full TypeScript support throughout
3. **Validation** - Auto-generated Zod schemas
4. **Enhanced APIs** - Type-safe hooks and utilities

## Schema Definition

The database schema is defined in **`schema.zmodel`** (ZenStack format):

```zmodel
// Enhanced Prisma schema with ZenStack features

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model AnatomyPart {
  id          String   @id @default(cuid())
  partId      String   @unique
  name        String
  system      AnatomySystem
  // ... more fields
}
```

## Schema Generation

ZenStack generates:

1. **Prisma Schema** → `prisma/schema.prisma`
2. **Prisma Client** → Type-safe database client
3. **Zod Schemas** → Runtime validation

```bash
# Generate all from ZenStack
npm run zenstack

# This runs:
# - zenstack generate (creates Prisma schema)
# - prisma generate (creates Prisma client)
```

## Database Models

### Core Models

#### AnatomyPart

Anatomical structures with hierarchical relationships:

```typescript
{
  id: string              // Unique identifier
  partId: string          // Semantic ID (e.g., "femur_left")
  name: string            // Display name
  latinName?: string      // Latin anatomical name
  system: AnatomySystem   // Which system (SKELETAL, etc.)
  parentId?: string       // Parent part for hierarchy
  modelPath?: string      // Path to 3D model
  lodLevels?: {           // Level of Detail models
    low: string
    medium: string
    high: string
  }
  boundingBox?: {         // For camera positioning
    min: { x, y, z }
    max: { x, y, z }
    center: { x, y, z }
    radius: number
  }
}
```

#### AnatomySynonym

Multi-language name mappings for NLP:

```typescript
{
  id: string;
  partId: string; // Links to AnatomyPart
  synonym: string; // Alternative name
  language: string; // ISO code (en, es, la, ja)
  priority: number; // Match priority (higher = preferred)
}
```

#### TeachingSession

Live teaching sessions with real-time state:

```typescript
{
  id: string
  code: string            // 6-char join code
  teacherId: string
  title: string
  isActive: boolean
  highlightedPart?: string
  cameraPosition?: { x, y, z }
  modelRotation?: { x, y, z }
  visibleSystems: string[]
  slicePosition?: {
    axis: 'x' | 'y' | 'z'
    position: number
  }
}
```

#### VoiceCommand

Analytics and command logging:

```typescript
{
  id: string
  sessionId?: string
  transcript: string      // Original speech
  intent?: string         // Dialogflow intent
  action?: string         // Parsed action
  target?: string         // Part ID or direction
  confidence?: number     // NLP confidence
  success: boolean
  errorMsg?: string
  userId?: string
  createdAt: Date
}
```

### Enums

```typescript
enum AnatomySystem {
  SKELETAL,
  MUSCULAR,
  NERVOUS,
  CARDIOVASCULAR,
  RESPIRATORY,
  DIGESTIVE,
  URINARY,
  REPRODUCTIVE,
  ENDOCRINE,
  LYMPHATIC,
  INTEGUMENTARY,
}

enum CommandAction {
  SHOW,
  HIDE,
  HIGHLIGHT,
  ISOLATE,
  ROTATE,
  ZOOM,
  SLICE,
  RESET,
  SYSTEM_TOGGLE,
}
```

## Database Operations

### Using Prisma Client

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Find anatomy parts by system
const parts = await prisma.anatomyPart.findMany({
  where: { system: "SKELETAL" },
  include: { synonyms: true },
});

// Create session
const session = await prisma.teachingSession.create({
  data: {
    code: generateCode(),
    title: "Intro to Anatomy",
    teacherId: userId,
    isActive: true,
  },
});

// Log voice command
await prisma.voiceCommand.create({
  data: {
    sessionId: session.id,
    transcript: "show the heart",
    intent: "anatomy.show",
    action: "SHOW",
    target: "heart",
    confidence: 0.95,
    success: true,
  },
});
```

### Using ZenStack Enhanced Client

```typescript
import { enhance } from "@zenstackhq/runtime";

const enhanced = enhance(prisma, { user: currentUser });

// Automatic access control based on schema rules
const parts = await enhanced.anatomyPart.findMany();
```

## Migrations

### Development

```bash
# Push schema changes to database (no migration files)
npm run prisma:push

# Create migration files
npx prisma migrate dev --name add_feature

# Apply migrations
npx prisma migrate deploy
```

### Production

```bash
# Generate migration
npx prisma migrate dev --name production_ready

# Apply to production
npx prisma migrate deploy
```

### Reset Database

```bash
# Reset and reseed
npm run prisma:push -- --force-reset
npm run db:seed
```

## Seeding

Initial data is seeded from `scripts/seed-anatomy.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seed anatomy parts
await prisma.anatomyPart.create({
  data: {
    partId: "skeleton",
    name: "Skeleton",
    system: "SKELETAL",
    modelPath: "/models/skeleton/skeleton-full.glb",
    synonyms: {
      create: [
        { synonym: "skeleton", language: "en", priority: 10 },
        { synonym: "bones", language: "en", priority: 8 },
      ],
    },
  },
});
```

Run seeding:

```bash
npm run db:seed
```

## Indexes

Optimized queries with strategic indexes:

```prisma
@@index([system])           // Parts by system
@@index([partId])           // Parts by ID
@@index([synonym])          // Synonym lookup
@@index([code])             // Session by code
@@index([isActive])         // Active sessions
@@index([createdAt])        // Command history
@@index([sessionId, studentId])  // Student notes
```

## Relationships

### Hierarchical Parts

```typescript
// Parent → Children
const skeleton = await prisma.anatomyPart.findUnique({
  where: { partId: "skeleton" },
  include: {
    children: true, // All child bones
  },
});

// Child → Parent
const femur = await prisma.anatomyPart.findUnique({
  where: { partId: "femur_left" },
  include: {
    parent: true, // The skeleton
  },
});
```

### Session Relations

```typescript
const session = await prisma.teachingSession.findUnique({
  where: { code: "ABC123" },
  include: {
    students: true, // All joined students
    notes: true, // All notes
    commands: true, // Command history
  },
});
```

## Type Safety

Full TypeScript support throughout:

```typescript
// Type-safe queries
type Part = Prisma.AnatomyPartGetPayload<{
  include: { synonyms: true };
}>;

// Type-safe creates
const partData: Prisma.AnatomyPartCreateInput = {
  partId: "new_part",
  name: "New Part",
  system: "SKELETAL", // Enum - autocomplete & validation
};

// Type-safe filters
const filter: Prisma.AnatomyPartWhereInput = {
  system: { in: ["SKELETAL", "MUSCULAR"] },
  synonyms: {
    some: {
      synonym: { contains: "bone" },
    },
  },
};
```

## Database Tools

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
# Open http://localhost:5555
```

### pgAdmin (Docker)

```bash
docker-compose --profile tools up -d pgadmin
# Open http://localhost:5050
# Email: admin@mediverse.local
# Password: admin
```

## Environment Configuration

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mediverse"

# Docker
DATABASE_URL="postgresql://mediverse:mediverse_password@postgres:5432/mediverse"
```

## Best Practices

1. **Always use Prisma Client** - Type-safe queries
2. **Define schema in .zmodel** - Single source of truth
3. **Run zenstack after schema changes** - Regenerate all
4. **Use migrations in production** - Trackable changes
5. **Index frequently queried fields** - Performance
6. **Use transactions for multi-step ops** - Data consistency
7. **Seed test data** - Reproducible development

## Query Examples

### Search Anatomy Parts

```typescript
// By name
const parts = await prisma.anatomyPart.findMany({
  where: {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { latinName: { contains: query, mode: "insensitive" } },
      {
        synonyms: {
          some: {
            synonym: { contains: query, mode: "insensitive" },
          },
        },
      },
    ],
  },
});
```

### Get Session Analytics

```typescript
const analytics = await prisma.teachingSession.findUnique({
  where: { id: sessionId },
  include: {
    _count: {
      select: {
        students: true,
        commands: true,
        notes: true,
      },
    },
    commands: {
      where: { success: true },
      select: { action: true },
    },
  },
});

const successRate =
  analytics._count.commands > 0
    ? analytics.commands.length / analytics._count.commands
    : 0;
```

## Troubleshooting

**Schema out of sync:**

```bash
npm run zenstack
npm run prisma:generate
```

**Migration conflicts:**

```bash
npx prisma migrate reset
npm run db:seed
```

**Connection errors:**

```bash
# Test connection
npx prisma db pull

# Check DATABASE_URL
echo $DATABASE_URL
```

## Resources

- [ZenStack Docs](https://zenstack.dev/)
- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
