import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const AnatomyPartScalarFieldEnumSchema = z.enum(['id','partId','name','latinName','meshName','system','parentId','modelPath','lodLevels','boundingBox','createdAt','updatedAt']);

export const AnatomySynonymScalarFieldEnumSchema = z.enum(['id','partId','synonym','language','priority']);

export const TeachingSessionScalarFieldEnumSchema = z.enum(['id','code','teacherId','title','isActive','highlightedPart','cameraPosition','modelRotation','visibleSystems','slicePosition','createdAt','updatedAt','endedAt']);

export const SessionStudentScalarFieldEnumSchema = z.enum(['id','sessionId','studentId','joinedAt']);

export const SessionNoteScalarFieldEnumSchema = z.enum(['id','sessionId','studentId','content','timestamp']);

export const VoiceCommandScalarFieldEnumSchema = z.enum(['id','sessionId','transcript','intent','action','target','confidence','success','errorMsg','userId','createdAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);

export const AnatomySystemSchema = z.enum(['SKELETAL','MUSCULAR','NERVOUS','CARDIOVASCULAR','RESPIRATORY','DIGESTIVE','URINARY','REPRODUCTIVE','ENDOCRINE','LYMPHATIC','INTEGUMENTARY']);

export type AnatomySystemType = `${z.infer<typeof AnatomySystemSchema>}`

export const CommandActionSchema = z.enum(['SHOW','HIDE','HIGHLIGHT','ISOLATE','ROTATE','ZOOM','SLICE','RESET','SYSTEM_TOGGLE']);

export type CommandActionType = `${z.infer<typeof CommandActionSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// ANATOMY PART SCHEMA
/////////////////////////////////////////

export const AnatomyPartSchema = z.object({
  system: AnatomySystemSchema,
  id: z.cuid(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().nullable(),
  meshName: z.string().nullable(),
  parentId: z.string().nullable(),
  modelPath: z.string().nullable(),
  lodLevels: JsonValueSchema.nullable(),
  boundingBox: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type AnatomyPart = z.infer<typeof AnatomyPartSchema>

/////////////////////////////////////////
// ANATOMY SYNONYM SCHEMA
/////////////////////////////////////////

export const AnatomySynonymSchema = z.object({
  id: z.cuid(),
  partId: z.string(),
  synonym: z.string(),
  language: z.string(),
  priority: z.number().int(),
})

export type AnatomySynonym = z.infer<typeof AnatomySynonymSchema>

/////////////////////////////////////////
// TEACHING SESSION SCHEMA
/////////////////////////////////////////

export const TeachingSessionSchema = z.object({
  id: z.cuid(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean(),
  highlightedPart: z.string().nullable(),
  cameraPosition: JsonValueSchema.nullable(),
  modelRotation: JsonValueSchema.nullable(),
  visibleSystems: z.string().array(),
  slicePosition: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  endedAt: z.coerce.date().nullable(),
})

export type TeachingSession = z.infer<typeof TeachingSessionSchema>

/////////////////////////////////////////
// SESSION STUDENT SCHEMA
/////////////////////////////////////////

export const SessionStudentSchema = z.object({
  id: z.cuid(),
  sessionId: z.string(),
  studentId: z.string(),
  joinedAt: z.coerce.date(),
})

export type SessionStudent = z.infer<typeof SessionStudentSchema>

/////////////////////////////////////////
// SESSION NOTE SCHEMA
/////////////////////////////////////////

export const SessionNoteSchema = z.object({
  id: z.cuid(),
  sessionId: z.string(),
  studentId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date(),
})

export type SessionNote = z.infer<typeof SessionNoteSchema>

/////////////////////////////////////////
// VOICE COMMAND SCHEMA
/////////////////////////////////////////

export const VoiceCommandSchema = z.object({
  id: z.cuid(),
  sessionId: z.string().nullable(),
  transcript: z.string(),
  intent: z.string().nullable(),
  action: z.string().nullable(),
  target: z.string().nullable(),
  confidence: z.number().nullable(),
  success: z.boolean(),
  errorMsg: z.string().nullable(),
  userId: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type VoiceCommand = z.infer<typeof VoiceCommandSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// ANATOMY PART
//------------------------------------------------------

export const AnatomyPartIncludeSchema: z.ZodType<Prisma.AnatomyPartInclude> = z.object({
  parent: z.union([z.boolean(),z.lazy(() => AnatomyPartArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => AnatomyPartFindManyArgsSchema)]).optional(),
  synonyms: z.union([z.boolean(),z.lazy(() => AnatomySynonymFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AnatomyPartCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const AnatomyPartArgsSchema: z.ZodType<Prisma.AnatomyPartDefaultArgs> = z.object({
  select: z.lazy(() => AnatomyPartSelectSchema).optional(),
  include: z.lazy(() => AnatomyPartIncludeSchema).optional(),
}).strict();

export const AnatomyPartCountOutputTypeArgsSchema: z.ZodType<Prisma.AnatomyPartCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => AnatomyPartCountOutputTypeSelectSchema).nullish(),
}).strict();

export const AnatomyPartCountOutputTypeSelectSchema: z.ZodType<Prisma.AnatomyPartCountOutputTypeSelect> = z.object({
  children: z.boolean().optional(),
  synonyms: z.boolean().optional(),
}).strict();

export const AnatomyPartSelectSchema: z.ZodType<Prisma.AnatomyPartSelect> = z.object({
  id: z.boolean().optional(),
  partId: z.boolean().optional(),
  name: z.boolean().optional(),
  latinName: z.boolean().optional(),
  meshName: z.boolean().optional(),
  system: z.boolean().optional(),
  parentId: z.boolean().optional(),
  modelPath: z.boolean().optional(),
  lodLevels: z.boolean().optional(),
  boundingBox: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  parent: z.union([z.boolean(),z.lazy(() => AnatomyPartArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => AnatomyPartFindManyArgsSchema)]).optional(),
  synonyms: z.union([z.boolean(),z.lazy(() => AnatomySynonymFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AnatomyPartCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ANATOMY SYNONYM
//------------------------------------------------------

export const AnatomySynonymIncludeSchema: z.ZodType<Prisma.AnatomySynonymInclude> = z.object({
  part: z.union([z.boolean(),z.lazy(() => AnatomyPartArgsSchema)]).optional(),
}).strict();

export const AnatomySynonymArgsSchema: z.ZodType<Prisma.AnatomySynonymDefaultArgs> = z.object({
  select: z.lazy(() => AnatomySynonymSelectSchema).optional(),
  include: z.lazy(() => AnatomySynonymIncludeSchema).optional(),
}).strict();

export const AnatomySynonymSelectSchema: z.ZodType<Prisma.AnatomySynonymSelect> = z.object({
  id: z.boolean().optional(),
  partId: z.boolean().optional(),
  synonym: z.boolean().optional(),
  language: z.boolean().optional(),
  priority: z.boolean().optional(),
  part: z.union([z.boolean(),z.lazy(() => AnatomyPartArgsSchema)]).optional(),
}).strict()

// TEACHING SESSION
//------------------------------------------------------

export const TeachingSessionIncludeSchema: z.ZodType<Prisma.TeachingSessionInclude> = z.object({
  notes: z.union([z.boolean(),z.lazy(() => SessionNoteFindManyArgsSchema)]).optional(),
  students: z.union([z.boolean(),z.lazy(() => SessionStudentFindManyArgsSchema)]).optional(),
  commands: z.union([z.boolean(),z.lazy(() => VoiceCommandFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TeachingSessionCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const TeachingSessionArgsSchema: z.ZodType<Prisma.TeachingSessionDefaultArgs> = z.object({
  select: z.lazy(() => TeachingSessionSelectSchema).optional(),
  include: z.lazy(() => TeachingSessionIncludeSchema).optional(),
}).strict();

export const TeachingSessionCountOutputTypeArgsSchema: z.ZodType<Prisma.TeachingSessionCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TeachingSessionCountOutputTypeSelectSchema).nullish(),
}).strict();

export const TeachingSessionCountOutputTypeSelectSchema: z.ZodType<Prisma.TeachingSessionCountOutputTypeSelect> = z.object({
  notes: z.boolean().optional(),
  students: z.boolean().optional(),
  commands: z.boolean().optional(),
}).strict();

export const TeachingSessionSelectSchema: z.ZodType<Prisma.TeachingSessionSelect> = z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  teacherId: z.boolean().optional(),
  title: z.boolean().optional(),
  isActive: z.boolean().optional(),
  highlightedPart: z.boolean().optional(),
  cameraPosition: z.boolean().optional(),
  modelRotation: z.boolean().optional(),
  visibleSystems: z.boolean().optional(),
  slicePosition: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  endedAt: z.boolean().optional(),
  notes: z.union([z.boolean(),z.lazy(() => SessionNoteFindManyArgsSchema)]).optional(),
  students: z.union([z.boolean(),z.lazy(() => SessionStudentFindManyArgsSchema)]).optional(),
  commands: z.union([z.boolean(),z.lazy(() => VoiceCommandFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TeachingSessionCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SESSION STUDENT
//------------------------------------------------------

export const SessionStudentIncludeSchema: z.ZodType<Prisma.SessionStudentInclude> = z.object({
  session: z.union([z.boolean(),z.lazy(() => TeachingSessionArgsSchema)]).optional(),
}).strict();

export const SessionStudentArgsSchema: z.ZodType<Prisma.SessionStudentDefaultArgs> = z.object({
  select: z.lazy(() => SessionStudentSelectSchema).optional(),
  include: z.lazy(() => SessionStudentIncludeSchema).optional(),
}).strict();

export const SessionStudentSelectSchema: z.ZodType<Prisma.SessionStudentSelect> = z.object({
  id: z.boolean().optional(),
  sessionId: z.boolean().optional(),
  studentId: z.boolean().optional(),
  joinedAt: z.boolean().optional(),
  session: z.union([z.boolean(),z.lazy(() => TeachingSessionArgsSchema)]).optional(),
}).strict()

// SESSION NOTE
//------------------------------------------------------

export const SessionNoteIncludeSchema: z.ZodType<Prisma.SessionNoteInclude> = z.object({
  session: z.union([z.boolean(),z.lazy(() => TeachingSessionArgsSchema)]).optional(),
}).strict();

export const SessionNoteArgsSchema: z.ZodType<Prisma.SessionNoteDefaultArgs> = z.object({
  select: z.lazy(() => SessionNoteSelectSchema).optional(),
  include: z.lazy(() => SessionNoteIncludeSchema).optional(),
}).strict();

export const SessionNoteSelectSchema: z.ZodType<Prisma.SessionNoteSelect> = z.object({
  id: z.boolean().optional(),
  sessionId: z.boolean().optional(),
  studentId: z.boolean().optional(),
  content: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  session: z.union([z.boolean(),z.lazy(() => TeachingSessionArgsSchema)]).optional(),
}).strict()

// VOICE COMMAND
//------------------------------------------------------

export const VoiceCommandIncludeSchema: z.ZodType<Prisma.VoiceCommandInclude> = z.object({
  session: z.union([z.boolean(),z.lazy(() => TeachingSessionArgsSchema)]).optional(),
}).strict();

export const VoiceCommandArgsSchema: z.ZodType<Prisma.VoiceCommandDefaultArgs> = z.object({
  select: z.lazy(() => VoiceCommandSelectSchema).optional(),
  include: z.lazy(() => VoiceCommandIncludeSchema).optional(),
}).strict();

export const VoiceCommandSelectSchema: z.ZodType<Prisma.VoiceCommandSelect> = z.object({
  id: z.boolean().optional(),
  sessionId: z.boolean().optional(),
  transcript: z.boolean().optional(),
  intent: z.boolean().optional(),
  action: z.boolean().optional(),
  target: z.boolean().optional(),
  confidence: z.boolean().optional(),
  success: z.boolean().optional(),
  errorMsg: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  session: z.union([z.boolean(),z.lazy(() => TeachingSessionArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const AnatomyPartWhereInputSchema: z.ZodType<Prisma.AnatomyPartWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnatomyPartWhereInputSchema), z.lazy(() => AnatomyPartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomyPartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomyPartWhereInputSchema), z.lazy(() => AnatomyPartWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  partId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  latinName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  meshName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  system: z.union([ z.lazy(() => EnumAnatomySystemFilterSchema), z.lazy(() => AnatomySystemSchema) ]).optional(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  modelPath: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  lodLevels: z.lazy(() => JsonNullableFilterSchema).optional(),
  boundingBox: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  parent: z.union([ z.lazy(() => AnatomyPartNullableScalarRelationFilterSchema), z.lazy(() => AnatomyPartWhereInputSchema) ]).optional().nullable(),
  children: z.lazy(() => AnatomyPartListRelationFilterSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymListRelationFilterSchema).optional(),
}).strict();

export const AnatomyPartOrderByWithRelationInputSchema: z.ZodType<Prisma.AnatomyPartOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  latinName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  meshName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  system: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  modelPath: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  lodLevels: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  boundingBox: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  parent: z.lazy(() => AnatomyPartOrderByWithRelationInputSchema).optional(),
  children: z.lazy(() => AnatomyPartOrderByRelationAggregateInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymOrderByRelationAggregateInputSchema).optional(),
}).strict();

export const AnatomyPartWhereUniqueInputSchema: z.ZodType<Prisma.AnatomyPartWhereUniqueInput> = z.union([
  z.object({
    id: z.cuid(),
    partId: z.string(),
  }),
  z.object({
    id: z.cuid(),
  }),
  z.object({
    partId: z.string(),
  }),
])
.and(z.object({
  id: z.cuid().optional(),
  partId: z.string().optional(),
  AND: z.union([ z.lazy(() => AnatomyPartWhereInputSchema), z.lazy(() => AnatomyPartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomyPartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomyPartWhereInputSchema), z.lazy(() => AnatomyPartWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  latinName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  meshName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  system: z.union([ z.lazy(() => EnumAnatomySystemFilterSchema), z.lazy(() => AnatomySystemSchema) ]).optional(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  modelPath: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  lodLevels: z.lazy(() => JsonNullableFilterSchema).optional(),
  boundingBox: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  parent: z.union([ z.lazy(() => AnatomyPartNullableScalarRelationFilterSchema), z.lazy(() => AnatomyPartWhereInputSchema) ]).optional().nullable(),
  children: z.lazy(() => AnatomyPartListRelationFilterSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymListRelationFilterSchema).optional(),
}).strict());

export const AnatomyPartOrderByWithAggregationInputSchema: z.ZodType<Prisma.AnatomyPartOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  latinName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  meshName: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  system: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  modelPath: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  lodLevels: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  boundingBox: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AnatomyPartCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AnatomyPartMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AnatomyPartMinOrderByAggregateInputSchema).optional(),
}).strict();

export const AnatomyPartScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AnatomyPartScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AnatomyPartScalarWhereWithAggregatesInputSchema), z.lazy(() => AnatomyPartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomyPartScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomyPartScalarWhereWithAggregatesInputSchema), z.lazy(() => AnatomyPartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  partId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  latinName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  meshName: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  system: z.union([ z.lazy(() => EnumAnatomySystemWithAggregatesFilterSchema), z.lazy(() => AnatomySystemSchema) ]).optional(),
  parentId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  modelPath: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  lodLevels: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  boundingBox: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const AnatomySynonymWhereInputSchema: z.ZodType<Prisma.AnatomySynonymWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnatomySynonymWhereInputSchema), z.lazy(() => AnatomySynonymWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomySynonymWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomySynonymWhereInputSchema), z.lazy(() => AnatomySynonymWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  partId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  synonym: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  language: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  priority: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  part: z.union([ z.lazy(() => AnatomyPartScalarRelationFilterSchema), z.lazy(() => AnatomyPartWhereInputSchema) ]).optional(),
}).strict();

export const AnatomySynonymOrderByWithRelationInputSchema: z.ZodType<Prisma.AnatomySynonymOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  synonym: z.lazy(() => SortOrderSchema).optional(),
  language: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  part: z.lazy(() => AnatomyPartOrderByWithRelationInputSchema).optional(),
}).strict();

export const AnatomySynonymWhereUniqueInputSchema: z.ZodType<Prisma.AnatomySynonymWhereUniqueInput> = z.union([
  z.object({
    id: z.cuid(),
    partId_synonym_language: z.lazy(() => AnatomySynonymPartIdSynonymLanguageCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.cuid(),
  }),
  z.object({
    partId_synonym_language: z.lazy(() => AnatomySynonymPartIdSynonymLanguageCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.cuid().optional(),
  partId_synonym_language: z.lazy(() => AnatomySynonymPartIdSynonymLanguageCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => AnatomySynonymWhereInputSchema), z.lazy(() => AnatomySynonymWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomySynonymWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomySynonymWhereInputSchema), z.lazy(() => AnatomySynonymWhereInputSchema).array() ]).optional(),
  partId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  synonym: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  language: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  priority: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  part: z.union([ z.lazy(() => AnatomyPartScalarRelationFilterSchema), z.lazy(() => AnatomyPartWhereInputSchema) ]).optional(),
}).strict());

export const AnatomySynonymOrderByWithAggregationInputSchema: z.ZodType<Prisma.AnatomySynonymOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  synonym: z.lazy(() => SortOrderSchema).optional(),
  language: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AnatomySynonymCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => AnatomySynonymAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AnatomySynonymMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AnatomySynonymMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => AnatomySynonymSumOrderByAggregateInputSchema).optional(),
}).strict();

export const AnatomySynonymScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AnatomySynonymScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AnatomySynonymScalarWhereWithAggregatesInputSchema), z.lazy(() => AnatomySynonymScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomySynonymScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomySynonymScalarWhereWithAggregatesInputSchema), z.lazy(() => AnatomySynonymScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  partId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  synonym: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  language: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  priority: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
}).strict();

export const TeachingSessionWhereInputSchema: z.ZodType<Prisma.TeachingSessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TeachingSessionWhereInputSchema), z.lazy(() => TeachingSessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TeachingSessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TeachingSessionWhereInputSchema), z.lazy(() => TeachingSessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  teacherId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  highlightedPart: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  cameraPosition: z.lazy(() => JsonNullableFilterSchema).optional(),
  modelRotation: z.lazy(() => JsonNullableFilterSchema).optional(),
  visibleSystems: z.lazy(() => StringNullableListFilterSchema).optional(),
  slicePosition: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  endedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteListRelationFilterSchema).optional(),
  students: z.lazy(() => SessionStudentListRelationFilterSchema).optional(),
  commands: z.lazy(() => VoiceCommandListRelationFilterSchema).optional(),
}).strict();

export const TeachingSessionOrderByWithRelationInputSchema: z.ZodType<Prisma.TeachingSessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  teacherId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  highlightedPart: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  cameraPosition: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  modelRotation: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  visibleSystems: z.lazy(() => SortOrderSchema).optional(),
  slicePosition: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  endedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  notes: z.lazy(() => SessionNoteOrderByRelationAggregateInputSchema).optional(),
  students: z.lazy(() => SessionStudentOrderByRelationAggregateInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandOrderByRelationAggregateInputSchema).optional(),
}).strict();

export const TeachingSessionWhereUniqueInputSchema: z.ZodType<Prisma.TeachingSessionWhereUniqueInput> = z.union([
  z.object({
    id: z.cuid(),
    code: z.string(),
  }),
  z.object({
    id: z.cuid(),
  }),
  z.object({
    code: z.string(),
  }),
])
.and(z.object({
  id: z.cuid().optional(),
  code: z.string().optional(),
  AND: z.union([ z.lazy(() => TeachingSessionWhereInputSchema), z.lazy(() => TeachingSessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TeachingSessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TeachingSessionWhereInputSchema), z.lazy(() => TeachingSessionWhereInputSchema).array() ]).optional(),
  teacherId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  highlightedPart: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  cameraPosition: z.lazy(() => JsonNullableFilterSchema).optional(),
  modelRotation: z.lazy(() => JsonNullableFilterSchema).optional(),
  visibleSystems: z.lazy(() => StringNullableListFilterSchema).optional(),
  slicePosition: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  endedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteListRelationFilterSchema).optional(),
  students: z.lazy(() => SessionStudentListRelationFilterSchema).optional(),
  commands: z.lazy(() => VoiceCommandListRelationFilterSchema).optional(),
}).strict());

export const TeachingSessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.TeachingSessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  teacherId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  highlightedPart: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  cameraPosition: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  modelRotation: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  visibleSystems: z.lazy(() => SortOrderSchema).optional(),
  slicePosition: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  endedAt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => TeachingSessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TeachingSessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TeachingSessionMinOrderByAggregateInputSchema).optional(),
}).strict();

export const TeachingSessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TeachingSessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TeachingSessionScalarWhereWithAggregatesInputSchema), z.lazy(() => TeachingSessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TeachingSessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TeachingSessionScalarWhereWithAggregatesInputSchema), z.lazy(() => TeachingSessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  code: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  teacherId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  highlightedPart: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  cameraPosition: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  modelRotation: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  visibleSystems: z.lazy(() => StringNullableListFilterSchema).optional(),
  slicePosition: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  endedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
}).strict();

export const SessionStudentWhereInputSchema: z.ZodType<Prisma.SessionStudentWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionStudentWhereInputSchema), z.lazy(() => SessionStudentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionStudentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionStudentWhereInputSchema), z.lazy(() => SessionStudentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  joinedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  session: z.union([ z.lazy(() => TeachingSessionScalarRelationFilterSchema), z.lazy(() => TeachingSessionWhereInputSchema) ]).optional(),
}).strict();

export const SessionStudentOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionStudentOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  joinedAt: z.lazy(() => SortOrderSchema).optional(),
  session: z.lazy(() => TeachingSessionOrderByWithRelationInputSchema).optional(),
}).strict();

export const SessionStudentWhereUniqueInputSchema: z.ZodType<Prisma.SessionStudentWhereUniqueInput> = z.union([
  z.object({
    id: z.cuid(),
    sessionId_studentId: z.lazy(() => SessionStudentSessionIdStudentIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.cuid(),
  }),
  z.object({
    sessionId_studentId: z.lazy(() => SessionStudentSessionIdStudentIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.cuid().optional(),
  sessionId_studentId: z.lazy(() => SessionStudentSessionIdStudentIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => SessionStudentWhereInputSchema), z.lazy(() => SessionStudentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionStudentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionStudentWhereInputSchema), z.lazy(() => SessionStudentWhereInputSchema).array() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  joinedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  session: z.union([ z.lazy(() => TeachingSessionScalarRelationFilterSchema), z.lazy(() => TeachingSessionWhereInputSchema) ]).optional(),
}).strict());

export const SessionStudentOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionStudentOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  joinedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionStudentCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionStudentMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionStudentMinOrderByAggregateInputSchema).optional(),
}).strict();

export const SessionStudentScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionStudentScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionStudentScalarWhereWithAggregatesInputSchema), z.lazy(() => SessionStudentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionStudentScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionStudentScalarWhereWithAggregatesInputSchema), z.lazy(() => SessionStudentScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  joinedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const SessionNoteWhereInputSchema: z.ZodType<Prisma.SessionNoteWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionNoteWhereInputSchema), z.lazy(() => SessionNoteWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionNoteWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionNoteWhereInputSchema), z.lazy(() => SessionNoteWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  session: z.union([ z.lazy(() => TeachingSessionScalarRelationFilterSchema), z.lazy(() => TeachingSessionWhereInputSchema) ]).optional(),
}).strict();

export const SessionNoteOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionNoteOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  session: z.lazy(() => TeachingSessionOrderByWithRelationInputSchema).optional(),
}).strict();

export const SessionNoteWhereUniqueInputSchema: z.ZodType<Prisma.SessionNoteWhereUniqueInput> = z.object({
  id: z.cuid(),
})
.and(z.object({
  id: z.cuid().optional(),
  AND: z.union([ z.lazy(() => SessionNoteWhereInputSchema), z.lazy(() => SessionNoteWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionNoteWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionNoteWhereInputSchema), z.lazy(() => SessionNoteWhereInputSchema).array() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  session: z.union([ z.lazy(() => TeachingSessionScalarRelationFilterSchema), z.lazy(() => TeachingSessionWhereInputSchema) ]).optional(),
}).strict());

export const SessionNoteOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionNoteOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionNoteCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionNoteMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionNoteMinOrderByAggregateInputSchema).optional(),
}).strict();

export const SessionNoteScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionNoteScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionNoteScalarWhereWithAggregatesInputSchema), z.lazy(() => SessionNoteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionNoteScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionNoteScalarWhereWithAggregatesInputSchema), z.lazy(() => SessionNoteScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const VoiceCommandWhereInputSchema: z.ZodType<Prisma.VoiceCommandWhereInput> = z.object({
  AND: z.union([ z.lazy(() => VoiceCommandWhereInputSchema), z.lazy(() => VoiceCommandWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoiceCommandWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoiceCommandWhereInputSchema), z.lazy(() => VoiceCommandWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  transcript: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  intent: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  action: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  confidence: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  success: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  errorMsg: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  session: z.union([ z.lazy(() => TeachingSessionNullableScalarRelationFilterSchema), z.lazy(() => TeachingSessionWhereInputSchema) ]).optional().nullable(),
}).strict();

export const VoiceCommandOrderByWithRelationInputSchema: z.ZodType<Prisma.VoiceCommandOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  transcript: z.lazy(() => SortOrderSchema).optional(),
  intent: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  target: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  confidence: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  success: z.lazy(() => SortOrderSchema).optional(),
  errorMsg: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  session: z.lazy(() => TeachingSessionOrderByWithRelationInputSchema).optional(),
}).strict();

export const VoiceCommandWhereUniqueInputSchema: z.ZodType<Prisma.VoiceCommandWhereUniqueInput> = z.object({
  id: z.cuid(),
})
.and(z.object({
  id: z.cuid().optional(),
  AND: z.union([ z.lazy(() => VoiceCommandWhereInputSchema), z.lazy(() => VoiceCommandWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoiceCommandWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoiceCommandWhereInputSchema), z.lazy(() => VoiceCommandWhereInputSchema).array() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  transcript: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  intent: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  action: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  confidence: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  success: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  errorMsg: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  session: z.union([ z.lazy(() => TeachingSessionNullableScalarRelationFilterSchema), z.lazy(() => TeachingSessionWhereInputSchema) ]).optional().nullable(),
}).strict());

export const VoiceCommandOrderByWithAggregationInputSchema: z.ZodType<Prisma.VoiceCommandOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  transcript: z.lazy(() => SortOrderSchema).optional(),
  intent: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  action: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  target: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  confidence: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  success: z.lazy(() => SortOrderSchema).optional(),
  errorMsg: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => VoiceCommandCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => VoiceCommandAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => VoiceCommandMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => VoiceCommandMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => VoiceCommandSumOrderByAggregateInputSchema).optional(),
}).strict();

export const VoiceCommandScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.VoiceCommandScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => VoiceCommandScalarWhereWithAggregatesInputSchema), z.lazy(() => VoiceCommandScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoiceCommandScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoiceCommandScalarWhereWithAggregatesInputSchema), z.lazy(() => VoiceCommandScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  transcript: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  intent: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  action: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  confidence: z.union([ z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  success: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  errorMsg: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const AnatomyPartCreateInputSchema: z.ZodType<Prisma.AnatomyPartCreateInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  parent: z.lazy(() => AnatomyPartCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => AnatomyPartCreateNestedManyWithoutParentInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymCreateNestedManyWithoutPartInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedCreateInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedCreateInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  parentId: z.string().optional().nullable(),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => AnatomyPartUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymUncheckedCreateNestedManyWithoutPartInputSchema).optional(),
}).strict();

export const AnatomyPartUpdateInputSchema: z.ZodType<Prisma.AnatomyPartUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  parent: z.lazy(() => AnatomyPartUpdateOneWithoutChildrenNestedInputSchema).optional(),
  children: z.lazy(() => AnatomyPartUpdateManyWithoutParentNestedInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymUpdateManyWithoutPartNestedInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedUpdateInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => AnatomyPartUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymUncheckedUpdateManyWithoutPartNestedInputSchema).optional(),
}).strict();

export const AnatomyPartCreateManyInputSchema: z.ZodType<Prisma.AnatomyPartCreateManyInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  parentId: z.string().optional().nullable(),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export const AnatomyPartUpdateManyMutationInputSchema: z.ZodType<Prisma.AnatomyPartUpdateManyMutationInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnatomyPartUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnatomySynonymCreateInputSchema: z.ZodType<Prisma.AnatomySynonymCreateInput> = z.object({
  id: z.cuid().optional(),
  synonym: z.string(),
  language: z.string().optional(),
  priority: z.number().int().optional(),
  part: z.lazy(() => AnatomyPartCreateNestedOneWithoutSynonymsInputSchema),
}).strict();

export const AnatomySynonymUncheckedCreateInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedCreateInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  synonym: z.string(),
  language: z.string().optional(),
  priority: z.number().int().optional(),
}).strict();

export const AnatomySynonymUpdateInputSchema: z.ZodType<Prisma.AnatomySynonymUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  synonym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  language: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  part: z.lazy(() => AnatomyPartUpdateOneRequiredWithoutSynonymsNestedInputSchema).optional(),
}).strict();

export const AnatomySynonymUncheckedUpdateInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  synonym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  language: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnatomySynonymCreateManyInputSchema: z.ZodType<Prisma.AnatomySynonymCreateManyInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  synonym: z.string(),
  language: z.string().optional(),
  priority: z.number().int().optional(),
}).strict();

export const AnatomySynonymUpdateManyMutationInputSchema: z.ZodType<Prisma.AnatomySynonymUpdateManyMutationInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  synonym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  language: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnatomySynonymUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  synonym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  language: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const TeachingSessionCreateInputSchema: z.ZodType<Prisma.TeachingSessionCreateInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  notes: z.lazy(() => SessionNoteCreateNestedManyWithoutSessionInputSchema).optional(),
  students: z.lazy(() => SessionStudentCreateNestedManyWithoutSessionInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedCreateInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedCreateInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  notes: z.lazy(() => SessionNoteUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
  students: z.lazy(() => SessionStudentUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionUpdateInputSchema: z.ZodType<Prisma.TeachingSessionUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteUpdateManyWithoutSessionNestedInputSchema).optional(),
  students: z.lazy(() => SessionStudentUpdateManyWithoutSessionNestedInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedUpdateInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
  students: z.lazy(() => SessionStudentUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const TeachingSessionCreateManyInputSchema: z.ZodType<Prisma.TeachingSessionCreateManyInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
}).strict();

export const TeachingSessionUpdateManyMutationInputSchema: z.ZodType<Prisma.TeachingSessionUpdateManyMutationInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const TeachingSessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const SessionStudentCreateInputSchema: z.ZodType<Prisma.SessionStudentCreateInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  joinedAt: z.coerce.date().optional(),
  session: z.lazy(() => TeachingSessionCreateNestedOneWithoutStudentsInputSchema),
}).strict();

export const SessionStudentUncheckedCreateInputSchema: z.ZodType<Prisma.SessionStudentUncheckedCreateInput> = z.object({
  id: z.cuid().optional(),
  sessionId: z.string(),
  studentId: z.string(),
  joinedAt: z.coerce.date().optional(),
}).strict();

export const SessionStudentUpdateInputSchema: z.ZodType<Prisma.SessionStudentUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  session: z.lazy(() => TeachingSessionUpdateOneRequiredWithoutStudentsNestedInputSchema).optional(),
}).strict();

export const SessionStudentUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionStudentUncheckedUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionStudentCreateManyInputSchema: z.ZodType<Prisma.SessionStudentCreateManyInput> = z.object({
  id: z.cuid().optional(),
  sessionId: z.string(),
  studentId: z.string(),
  joinedAt: z.coerce.date().optional(),
}).strict();

export const SessionStudentUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionStudentUpdateManyMutationInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionStudentUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionStudentUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionNoteCreateInputSchema: z.ZodType<Prisma.SessionNoteCreateInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date().optional(),
  session: z.lazy(() => TeachingSessionCreateNestedOneWithoutNotesInputSchema),
}).strict();

export const SessionNoteUncheckedCreateInputSchema: z.ZodType<Prisma.SessionNoteUncheckedCreateInput> = z.object({
  id: z.cuid().optional(),
  sessionId: z.string(),
  studentId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date().optional(),
}).strict();

export const SessionNoteUpdateInputSchema: z.ZodType<Prisma.SessionNoteUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  session: z.lazy(() => TeachingSessionUpdateOneRequiredWithoutNotesNestedInputSchema).optional(),
}).strict();

export const SessionNoteUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionNoteUncheckedUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionNoteCreateManyInputSchema: z.ZodType<Prisma.SessionNoteCreateManyInput> = z.object({
  id: z.cuid().optional(),
  sessionId: z.string(),
  studentId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date().optional(),
}).strict();

export const SessionNoteUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionNoteUpdateManyMutationInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionNoteUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionNoteUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VoiceCommandCreateInputSchema: z.ZodType<Prisma.VoiceCommandCreateInput> = z.object({
  id: z.cuid().optional(),
  transcript: z.string(),
  intent: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  target: z.string().optional().nullable(),
  confidence: z.number().optional().nullable(),
  success: z.boolean().optional(),
  errorMsg: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  session: z.lazy(() => TeachingSessionCreateNestedOneWithoutCommandsInputSchema).optional(),
}).strict();

export const VoiceCommandUncheckedCreateInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedCreateInput> = z.object({
  id: z.cuid().optional(),
  sessionId: z.string().optional().nullable(),
  transcript: z.string(),
  intent: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  target: z.string().optional().nullable(),
  confidence: z.number().optional().nullable(),
  success: z.boolean().optional(),
  errorMsg: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
}).strict();

export const VoiceCommandUpdateInputSchema: z.ZodType<Prisma.VoiceCommandUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  transcript: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  intent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  action: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  confidence: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  success: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  errorMsg: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  session: z.lazy(() => TeachingSessionUpdateOneWithoutCommandsNestedInputSchema).optional(),
}).strict();

export const VoiceCommandUncheckedUpdateInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedUpdateInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transcript: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  intent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  action: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  confidence: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  success: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  errorMsg: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VoiceCommandCreateManyInputSchema: z.ZodType<Prisma.VoiceCommandCreateManyInput> = z.object({
  id: z.cuid().optional(),
  sessionId: z.string().optional().nullable(),
  transcript: z.string(),
  intent: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  target: z.string().optional().nullable(),
  confidence: z.number().optional().nullable(),
  success: z.boolean().optional(),
  errorMsg: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
}).strict();

export const VoiceCommandUpdateManyMutationInputSchema: z.ZodType<Prisma.VoiceCommandUpdateManyMutationInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  transcript: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  intent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  action: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  confidence: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  success: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  errorMsg: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VoiceCommandUncheckedUpdateManyInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sessionId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  transcript: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  intent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  action: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  confidence: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  success: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  errorMsg: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const EnumAnatomySystemFilterSchema: z.ZodType<Prisma.EnumAnatomySystemFilter> = z.object({
  equals: z.lazy(() => AnatomySystemSchema).optional(),
  in: z.lazy(() => AnatomySystemSchema).array().optional(),
  notIn: z.lazy(() => AnatomySystemSchema).array().optional(),
  not: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => NestedEnumAnatomySystemFilterSchema) ]).optional(),
}).strict();

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const AnatomyPartNullableScalarRelationFilterSchema: z.ZodType<Prisma.AnatomyPartNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => AnatomyPartWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => AnatomyPartWhereInputSchema).optional().nullable(),
}).strict();

export const AnatomyPartListRelationFilterSchema: z.ZodType<Prisma.AnatomyPartListRelationFilter> = z.object({
  every: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
  some: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
  none: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
}).strict();

export const AnatomySynonymListRelationFilterSchema: z.ZodType<Prisma.AnatomySynonymListRelationFilter> = z.object({
  every: z.lazy(() => AnatomySynonymWhereInputSchema).optional(),
  some: z.lazy(() => AnatomySynonymWhereInputSchema).optional(),
  none: z.lazy(() => AnatomySynonymWhereInputSchema).optional(),
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
}).strict();

export const AnatomyPartOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AnatomyPartOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomySynonymOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AnatomySynonymOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomyPartCountOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomyPartCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  latinName: z.lazy(() => SortOrderSchema).optional(),
  meshName: z.lazy(() => SortOrderSchema).optional(),
  system: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.lazy(() => SortOrderSchema).optional(),
  modelPath: z.lazy(() => SortOrderSchema).optional(),
  lodLevels: z.lazy(() => SortOrderSchema).optional(),
  boundingBox: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomyPartMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomyPartMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  latinName: z.lazy(() => SortOrderSchema).optional(),
  meshName: z.lazy(() => SortOrderSchema).optional(),
  system: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.lazy(() => SortOrderSchema).optional(),
  modelPath: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomyPartMinOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomyPartMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  latinName: z.lazy(() => SortOrderSchema).optional(),
  meshName: z.lazy(() => SortOrderSchema).optional(),
  system: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.lazy(() => SortOrderSchema).optional(),
  modelPath: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
}).strict();

export const EnumAnatomySystemWithAggregatesFilterSchema: z.ZodType<Prisma.EnumAnatomySystemWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AnatomySystemSchema).optional(),
  in: z.lazy(() => AnatomySystemSchema).array().optional(),
  notIn: z.lazy(() => AnatomySystemSchema).array().optional(),
  not: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => NestedEnumAnatomySystemWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAnatomySystemFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAnatomySystemFilterSchema).optional(),
}).strict();

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const AnatomyPartScalarRelationFilterSchema: z.ZodType<Prisma.AnatomyPartScalarRelationFilter> = z.object({
  is: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
  isNot: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
}).strict();

export const AnatomySynonymPartIdSynonymLanguageCompoundUniqueInputSchema: z.ZodType<Prisma.AnatomySynonymPartIdSynonymLanguageCompoundUniqueInput> = z.object({
  partId: z.string(),
  synonym: z.string(),
  language: z.string(),
}).strict();

export const AnatomySynonymCountOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomySynonymCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  synonym: z.lazy(() => SortOrderSchema).optional(),
  language: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomySynonymAvgOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomySynonymAvgOrderByAggregateInput> = z.object({
  priority: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomySynonymMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomySynonymMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  synonym: z.lazy(() => SortOrderSchema).optional(),
  language: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomySynonymMinOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomySynonymMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  partId: z.lazy(() => SortOrderSchema).optional(),
  synonym: z.lazy(() => SortOrderSchema).optional(),
  language: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const AnatomySynonymSumOrderByAggregateInputSchema: z.ZodType<Prisma.AnatomySynonymSumOrderByAggregateInput> = z.object({
  priority: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional(),
}).strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const SessionNoteListRelationFilterSchema: z.ZodType<Prisma.SessionNoteListRelationFilter> = z.object({
  every: z.lazy(() => SessionNoteWhereInputSchema).optional(),
  some: z.lazy(() => SessionNoteWhereInputSchema).optional(),
  none: z.lazy(() => SessionNoteWhereInputSchema).optional(),
}).strict();

export const SessionStudentListRelationFilterSchema: z.ZodType<Prisma.SessionStudentListRelationFilter> = z.object({
  every: z.lazy(() => SessionStudentWhereInputSchema).optional(),
  some: z.lazy(() => SessionStudentWhereInputSchema).optional(),
  none: z.lazy(() => SessionStudentWhereInputSchema).optional(),
}).strict();

export const VoiceCommandListRelationFilterSchema: z.ZodType<Prisma.VoiceCommandListRelationFilter> = z.object({
  every: z.lazy(() => VoiceCommandWhereInputSchema).optional(),
  some: z.lazy(() => VoiceCommandWhereInputSchema).optional(),
  none: z.lazy(() => VoiceCommandWhereInputSchema).optional(),
}).strict();

export const SessionNoteOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionNoteOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const SessionStudentOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SessionStudentOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const VoiceCommandOrderByRelationAggregateInputSchema: z.ZodType<Prisma.VoiceCommandOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const TeachingSessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.TeachingSessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  teacherId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  highlightedPart: z.lazy(() => SortOrderSchema).optional(),
  cameraPosition: z.lazy(() => SortOrderSchema).optional(),
  modelRotation: z.lazy(() => SortOrderSchema).optional(),
  visibleSystems: z.lazy(() => SortOrderSchema).optional(),
  slicePosition: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  endedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const TeachingSessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TeachingSessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  teacherId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  highlightedPart: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  endedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const TeachingSessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.TeachingSessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  teacherId: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  highlightedPart: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  endedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
}).strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
}).strict();

export const TeachingSessionScalarRelationFilterSchema: z.ZodType<Prisma.TeachingSessionScalarRelationFilter> = z.object({
  is: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
  isNot: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
}).strict();

export const SessionStudentSessionIdStudentIdCompoundUniqueInputSchema: z.ZodType<Prisma.SessionStudentSessionIdStudentIdCompoundUniqueInput> = z.object({
  sessionId: z.string(),
  studentId: z.string(),
}).strict();

export const SessionStudentCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionStudentCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  joinedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const SessionStudentMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionStudentMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  joinedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const SessionStudentMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionStudentMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  joinedAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const SessionNoteCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionNoteCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const SessionNoteMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionNoteMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const SessionNoteMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionNoteMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  studentId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const FloatNullableFilterSchema: z.ZodType<Prisma.FloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const TeachingSessionNullableScalarRelationFilterSchema: z.ZodType<Prisma.TeachingSessionNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => TeachingSessionWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => TeachingSessionWhereInputSchema).optional().nullable(),
}).strict();

export const VoiceCommandCountOrderByAggregateInputSchema: z.ZodType<Prisma.VoiceCommandCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  transcript: z.lazy(() => SortOrderSchema).optional(),
  intent: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  confidence: z.lazy(() => SortOrderSchema).optional(),
  success: z.lazy(() => SortOrderSchema).optional(),
  errorMsg: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const VoiceCommandAvgOrderByAggregateInputSchema: z.ZodType<Prisma.VoiceCommandAvgOrderByAggregateInput> = z.object({
  confidence: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const VoiceCommandMaxOrderByAggregateInputSchema: z.ZodType<Prisma.VoiceCommandMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  transcript: z.lazy(() => SortOrderSchema).optional(),
  intent: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  confidence: z.lazy(() => SortOrderSchema).optional(),
  success: z.lazy(() => SortOrderSchema).optional(),
  errorMsg: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const VoiceCommandMinOrderByAggregateInputSchema: z.ZodType<Prisma.VoiceCommandMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sessionId: z.lazy(() => SortOrderSchema).optional(),
  transcript: z.lazy(() => SortOrderSchema).optional(),
  intent: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  target: z.lazy(() => SortOrderSchema).optional(),
  confidence: z.lazy(() => SortOrderSchema).optional(),
  success: z.lazy(() => SortOrderSchema).optional(),
  errorMsg: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const VoiceCommandSumOrderByAggregateInputSchema: z.ZodType<Prisma.VoiceCommandSumOrderByAggregateInput> = z.object({
  confidence: z.lazy(() => SortOrderSchema).optional(),
}).strict();

export const FloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.FloatNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
}).strict();

export const AnatomyPartCreateNestedOneWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartCreateNestedOneWithoutChildrenInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AnatomyPartCreateOrConnectWithoutChildrenInputSchema).optional(),
  connect: z.lazy(() => AnatomyPartWhereUniqueInputSchema).optional(),
}).strict();

export const AnatomyPartCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartCreateNestedManyWithoutParentInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateWithoutParentInputSchema).array(), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomyPartCreateManyParentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnatomySynonymCreateNestedManyWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymCreateNestedManyWithoutPartInput> = z.object({
  create: z.union([ z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema).array(), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomySynonymCreateManyPartInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnatomyPartUncheckedCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedCreateNestedManyWithoutParentInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateWithoutParentInputSchema).array(), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomyPartCreateManyParentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnatomySynonymUncheckedCreateNestedManyWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedCreateNestedManyWithoutPartInput> = z.object({
  create: z.union([ z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema).array(), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomySynonymCreateManyPartInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional(),
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable(),
}).strict();

export const EnumAnatomySystemFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumAnatomySystemFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => AnatomySystemSchema).optional(),
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional(),
}).strict();

export const AnatomyPartUpdateOneWithoutChildrenNestedInputSchema: z.ZodType<Prisma.AnatomyPartUpdateOneWithoutChildrenNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AnatomyPartCreateOrConnectWithoutChildrenInputSchema).optional(),
  upsert: z.lazy(() => AnatomyPartUpsertWithoutChildrenInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => AnatomyPartWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => AnatomyPartWhereInputSchema) ]).optional(),
  connect: z.lazy(() => AnatomyPartWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AnatomyPartUpdateToOneWithWhereWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUpdateWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutChildrenInputSchema) ]).optional(),
}).strict();

export const AnatomyPartUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.AnatomyPartUpdateManyWithoutParentNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateWithoutParentInputSchema).array(), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnatomyPartUpsertWithWhereUniqueWithoutParentInputSchema), z.lazy(() => AnatomyPartUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomyPartCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnatomyPartUpdateWithWhereUniqueWithoutParentInputSchema), z.lazy(() => AnatomyPartUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnatomyPartUpdateManyWithWhereWithoutParentInputSchema), z.lazy(() => AnatomyPartUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnatomyPartScalarWhereInputSchema), z.lazy(() => AnatomyPartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnatomySynonymUpdateManyWithoutPartNestedInputSchema: z.ZodType<Prisma.AnatomySynonymUpdateManyWithoutPartNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema).array(), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnatomySynonymUpsertWithWhereUniqueWithoutPartInputSchema), z.lazy(() => AnatomySynonymUpsertWithWhereUniqueWithoutPartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomySynonymCreateManyPartInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnatomySynonymUpdateWithWhereUniqueWithoutPartInputSchema), z.lazy(() => AnatomySynonymUpdateWithWhereUniqueWithoutPartInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnatomySynonymUpdateManyWithWhereWithoutPartInputSchema), z.lazy(() => AnatomySynonymUpdateManyWithWhereWithoutPartInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnatomySynonymScalarWhereInputSchema), z.lazy(() => AnatomySynonymScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnatomyPartUncheckedUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedUpdateManyWithoutParentNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateWithoutParentInputSchema).array(), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema), z.lazy(() => AnatomyPartCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnatomyPartUpsertWithWhereUniqueWithoutParentInputSchema), z.lazy(() => AnatomyPartUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomyPartCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnatomyPartWhereUniqueInputSchema), z.lazy(() => AnatomyPartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnatomyPartUpdateWithWhereUniqueWithoutParentInputSchema), z.lazy(() => AnatomyPartUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnatomyPartUpdateManyWithWhereWithoutParentInputSchema), z.lazy(() => AnatomyPartUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnatomyPartScalarWhereInputSchema), z.lazy(() => AnatomyPartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnatomySynonymUncheckedUpdateManyWithoutPartNestedInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedUpdateManyWithoutPartNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema).array(), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema), z.lazy(() => AnatomySynonymCreateOrConnectWithoutPartInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnatomySynonymUpsertWithWhereUniqueWithoutPartInputSchema), z.lazy(() => AnatomySynonymUpsertWithWhereUniqueWithoutPartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnatomySynonymCreateManyPartInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnatomySynonymWhereUniqueInputSchema), z.lazy(() => AnatomySynonymWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnatomySynonymUpdateWithWhereUniqueWithoutPartInputSchema), z.lazy(() => AnatomySynonymUpdateWithWhereUniqueWithoutPartInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnatomySynonymUpdateManyWithWhereWithoutPartInputSchema), z.lazy(() => AnatomySynonymUpdateManyWithWhereWithoutPartInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnatomySynonymScalarWhereInputSchema), z.lazy(() => AnatomySynonymScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnatomyPartCreateNestedOneWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartCreateNestedOneWithoutSynonymsInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutSynonymsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AnatomyPartCreateOrConnectWithoutSynonymsInputSchema).optional(),
  connect: z.lazy(() => AnatomyPartWhereUniqueInputSchema).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
}).strict();

export const AnatomyPartUpdateOneRequiredWithoutSynonymsNestedInputSchema: z.ZodType<Prisma.AnatomyPartUpdateOneRequiredWithoutSynonymsNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutSynonymsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AnatomyPartCreateOrConnectWithoutSynonymsInputSchema).optional(),
  upsert: z.lazy(() => AnatomyPartUpsertWithoutSynonymsInputSchema).optional(),
  connect: z.lazy(() => AnatomyPartWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AnatomyPartUpdateToOneWithWhereWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUpdateWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutSynonymsInputSchema) ]).optional(),
}).strict();

export const TeachingSessionCreatevisibleSystemsInputSchema: z.ZodType<Prisma.TeachingSessionCreatevisibleSystemsInput> = z.object({
  set: z.string().array(),
}).strict();

export const SessionNoteCreateNestedManyWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteCreateNestedManyWithoutSessionInput> = z.object({
  create: z.union([ z.lazy(() => SessionNoteCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionNoteCreateManySessionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionStudentCreateNestedManyWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentCreateNestedManyWithoutSessionInput> = z.object({
  create: z.union([ z.lazy(() => SessionStudentCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionStudentCreateManySessionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const VoiceCommandCreateNestedManyWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandCreateNestedManyWithoutSessionInput> = z.object({
  create: z.union([ z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema).array(), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoiceCommandCreateManySessionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionNoteUncheckedCreateNestedManyWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUncheckedCreateNestedManyWithoutSessionInput> = z.object({
  create: z.union([ z.lazy(() => SessionNoteCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionNoteCreateManySessionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const SessionStudentUncheckedCreateNestedManyWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUncheckedCreateNestedManyWithoutSessionInput> = z.object({
  create: z.union([ z.lazy(() => SessionStudentCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionStudentCreateManySessionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const VoiceCommandUncheckedCreateNestedManyWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedCreateNestedManyWithoutSessionInput> = z.object({
  create: z.union([ z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema).array(), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoiceCommandCreateManySessionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional(),
}).strict();

export const TeachingSessionUpdatevisibleSystemsInputSchema: z.ZodType<Prisma.TeachingSessionUpdatevisibleSystemsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional().nullable(),
}).strict();

export const SessionNoteUpdateManyWithoutSessionNestedInputSchema: z.ZodType<Prisma.SessionNoteUpdateManyWithoutSessionNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionNoteCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionNoteUpsertWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionNoteUpsertWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionNoteCreateManySessionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionNoteUpdateWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionNoteUpdateWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionNoteUpdateManyWithWhereWithoutSessionInputSchema), z.lazy(() => SessionNoteUpdateManyWithWhereWithoutSessionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionNoteScalarWhereInputSchema), z.lazy(() => SessionNoteScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionStudentUpdateManyWithoutSessionNestedInputSchema: z.ZodType<Prisma.SessionStudentUpdateManyWithoutSessionNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionStudentCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionStudentUpsertWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionStudentUpsertWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionStudentCreateManySessionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionStudentUpdateWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionStudentUpdateWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionStudentUpdateManyWithWhereWithoutSessionInputSchema), z.lazy(() => SessionStudentUpdateManyWithWhereWithoutSessionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionStudentScalarWhereInputSchema), z.lazy(() => SessionStudentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const VoiceCommandUpdateManyWithoutSessionNestedInputSchema: z.ZodType<Prisma.VoiceCommandUpdateManyWithoutSessionNestedInput> = z.object({
  create: z.union([ z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema).array(), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoiceCommandUpsertWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => VoiceCommandUpsertWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoiceCommandCreateManySessionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoiceCommandUpdateWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => VoiceCommandUpdateWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoiceCommandUpdateManyWithWhereWithoutSessionInputSchema), z.lazy(() => VoiceCommandUpdateManyWithWhereWithoutSessionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoiceCommandScalarWhereInputSchema), z.lazy(() => VoiceCommandScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionNoteUncheckedUpdateManyWithoutSessionNestedInputSchema: z.ZodType<Prisma.SessionNoteUncheckedUpdateManyWithoutSessionNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionNoteCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionNoteCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionNoteUpsertWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionNoteUpsertWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionNoteCreateManySessionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionNoteWhereUniqueInputSchema), z.lazy(() => SessionNoteWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionNoteUpdateWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionNoteUpdateWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionNoteUpdateManyWithWhereWithoutSessionInputSchema), z.lazy(() => SessionNoteUpdateManyWithWhereWithoutSessionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionNoteScalarWhereInputSchema), z.lazy(() => SessionNoteScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const SessionStudentUncheckedUpdateManyWithoutSessionNestedInputSchema: z.ZodType<Prisma.SessionStudentUncheckedUpdateManyWithoutSessionNestedInput> = z.object({
  create: z.union([ z.lazy(() => SessionStudentCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateWithoutSessionInputSchema).array(), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema), z.lazy(() => SessionStudentCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => SessionStudentUpsertWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionStudentUpsertWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => SessionStudentCreateManySessionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SessionStudentWhereUniqueInputSchema), z.lazy(() => SessionStudentWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => SessionStudentUpdateWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => SessionStudentUpdateWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => SessionStudentUpdateManyWithWhereWithoutSessionInputSchema), z.lazy(() => SessionStudentUpdateManyWithWhereWithoutSessionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => SessionStudentScalarWhereInputSchema), z.lazy(() => SessionStudentScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const VoiceCommandUncheckedUpdateManyWithoutSessionNestedInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedUpdateManyWithoutSessionNestedInput> = z.object({
  create: z.union([ z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema).array(), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema), z.lazy(() => VoiceCommandCreateOrConnectWithoutSessionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => VoiceCommandUpsertWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => VoiceCommandUpsertWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => VoiceCommandCreateManySessionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => VoiceCommandWhereUniqueInputSchema), z.lazy(() => VoiceCommandWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => VoiceCommandUpdateWithWhereUniqueWithoutSessionInputSchema), z.lazy(() => VoiceCommandUpdateWithWhereUniqueWithoutSessionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => VoiceCommandUpdateManyWithWhereWithoutSessionInputSchema), z.lazy(() => VoiceCommandUpdateManyWithWhereWithoutSessionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => VoiceCommandScalarWhereInputSchema), z.lazy(() => VoiceCommandScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const TeachingSessionCreateNestedOneWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionCreateNestedOneWithoutStudentsInput> = z.object({
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutStudentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TeachingSessionCreateOrConnectWithoutStudentsInputSchema).optional(),
  connect: z.lazy(() => TeachingSessionWhereUniqueInputSchema).optional(),
}).strict();

export const TeachingSessionUpdateOneRequiredWithoutStudentsNestedInputSchema: z.ZodType<Prisma.TeachingSessionUpdateOneRequiredWithoutStudentsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutStudentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TeachingSessionCreateOrConnectWithoutStudentsInputSchema).optional(),
  upsert: z.lazy(() => TeachingSessionUpsertWithoutStudentsInputSchema).optional(),
  connect: z.lazy(() => TeachingSessionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TeachingSessionUpdateToOneWithWhereWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUpdateWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutStudentsInputSchema) ]).optional(),
}).strict();

export const TeachingSessionCreateNestedOneWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionCreateNestedOneWithoutNotesInput> = z.object({
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutNotesInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutNotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TeachingSessionCreateOrConnectWithoutNotesInputSchema).optional(),
  connect: z.lazy(() => TeachingSessionWhereUniqueInputSchema).optional(),
}).strict();

export const TeachingSessionUpdateOneRequiredWithoutNotesNestedInputSchema: z.ZodType<Prisma.TeachingSessionUpdateOneRequiredWithoutNotesNestedInput> = z.object({
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutNotesInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutNotesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TeachingSessionCreateOrConnectWithoutNotesInputSchema).optional(),
  upsert: z.lazy(() => TeachingSessionUpsertWithoutNotesInputSchema).optional(),
  connect: z.lazy(() => TeachingSessionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TeachingSessionUpdateToOneWithWhereWithoutNotesInputSchema), z.lazy(() => TeachingSessionUpdateWithoutNotesInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutNotesInputSchema) ]).optional(),
}).strict();

export const TeachingSessionCreateNestedOneWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionCreateNestedOneWithoutCommandsInput> = z.object({
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutCommandsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TeachingSessionCreateOrConnectWithoutCommandsInputSchema).optional(),
  connect: z.lazy(() => TeachingSessionWhereUniqueInputSchema).optional(),
}).strict();

export const NullableFloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
}).strict();

export const TeachingSessionUpdateOneWithoutCommandsNestedInputSchema: z.ZodType<Prisma.TeachingSessionUpdateOneWithoutCommandsNestedInput> = z.object({
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutCommandsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TeachingSessionCreateOrConnectWithoutCommandsInputSchema).optional(),
  upsert: z.lazy(() => TeachingSessionUpsertWithoutCommandsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => TeachingSessionWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => TeachingSessionWhereInputSchema) ]).optional(),
  connect: z.lazy(() => TeachingSessionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TeachingSessionUpdateToOneWithWhereWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUpdateWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutCommandsInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumAnatomySystemFilterSchema: z.ZodType<Prisma.NestedEnumAnatomySystemFilter> = z.object({
  equals: z.lazy(() => AnatomySystemSchema).optional(),
  in: z.lazy(() => AnatomySystemSchema).array().optional(),
  notIn: z.lazy(() => AnatomySystemSchema).array().optional(),
  not: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => NestedEnumAnatomySystemFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumAnatomySystemWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumAnatomySystemWithAggregatesFilter> = z.object({
  equals: z.lazy(() => AnatomySystemSchema).optional(),
  in: z.lazy(() => AnatomySystemSchema).array().optional(),
  notIn: z.lazy(() => AnatomySystemSchema).array().optional(),
  not: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => NestedEnumAnatomySystemWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumAnatomySystemFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumAnatomySystemFilterSchema).optional(),
}).strict();

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
}).strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedFloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
}).strict();

export const AnatomyPartCreateWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartCreateWithoutChildrenInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  parent: z.lazy(() => AnatomyPartCreateNestedOneWithoutChildrenInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymCreateNestedManyWithoutPartInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedCreateWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedCreateWithoutChildrenInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  parentId: z.string().optional().nullable(),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  synonyms: z.lazy(() => AnatomySynonymUncheckedCreateNestedManyWithoutPartInputSchema).optional(),
}).strict();

export const AnatomyPartCreateOrConnectWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartCreateOrConnectWithoutChildrenInput> = z.object({
  where: z.lazy(() => AnatomyPartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutChildrenInputSchema) ]),
}).strict();

export const AnatomyPartCreateWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartCreateWithoutParentInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => AnatomyPartCreateNestedManyWithoutParentInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymCreateNestedManyWithoutPartInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedCreateWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedCreateWithoutParentInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => AnatomyPartUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymUncheckedCreateNestedManyWithoutPartInputSchema).optional(),
}).strict();

export const AnatomyPartCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartCreateOrConnectWithoutParentInput> = z.object({
  where: z.lazy(() => AnatomyPartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export const AnatomyPartCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.AnatomyPartCreateManyParentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AnatomyPartCreateManyParentInputSchema), z.lazy(() => AnatomyPartCreateManyParentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AnatomySynonymCreateWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymCreateWithoutPartInput> = z.object({
  id: z.cuid().optional(),
  synonym: z.string(),
  language: z.string().optional(),
  priority: z.number().int().optional(),
}).strict();

export const AnatomySynonymUncheckedCreateWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedCreateWithoutPartInput> = z.object({
  id: z.cuid().optional(),
  synonym: z.string(),
  language: z.string().optional(),
  priority: z.number().int().optional(),
}).strict();

export const AnatomySynonymCreateOrConnectWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymCreateOrConnectWithoutPartInput> = z.object({
  where: z.lazy(() => AnatomySynonymWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema) ]),
}).strict();

export const AnatomySynonymCreateManyPartInputEnvelopeSchema: z.ZodType<Prisma.AnatomySynonymCreateManyPartInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AnatomySynonymCreateManyPartInputSchema), z.lazy(() => AnatomySynonymCreateManyPartInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AnatomyPartUpsertWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartUpsertWithoutChildrenInput> = z.object({
  update: z.union([ z.lazy(() => AnatomyPartUpdateWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutChildrenInputSchema) ]),
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutChildrenInputSchema) ]),
  where: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
}).strict();

export const AnatomyPartUpdateToOneWithWhereWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartUpdateToOneWithWhereWithoutChildrenInput> = z.object({
  where: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AnatomyPartUpdateWithoutChildrenInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutChildrenInputSchema) ]),
}).strict();

export const AnatomyPartUpdateWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartUpdateWithoutChildrenInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  parent: z.lazy(() => AnatomyPartUpdateOneWithoutChildrenNestedInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymUpdateManyWithoutPartNestedInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedUpdateWithoutChildrenInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedUpdateWithoutChildrenInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  synonyms: z.lazy(() => AnatomySynonymUncheckedUpdateManyWithoutPartNestedInputSchema).optional(),
}).strict();

export const AnatomyPartUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUpsertWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => AnatomyPartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AnatomyPartUpdateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutParentInputSchema) ]),
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export const AnatomyPartUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUpdateWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => AnatomyPartWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AnatomyPartUpdateWithoutParentInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutParentInputSchema) ]),
}).strict();

export const AnatomyPartUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUpdateManyWithWhereWithoutParentInput> = z.object({
  where: z.lazy(() => AnatomyPartScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AnatomyPartUpdateManyMutationInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateManyWithoutParentInputSchema) ]),
}).strict();

export const AnatomyPartScalarWhereInputSchema: z.ZodType<Prisma.AnatomyPartScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnatomyPartScalarWhereInputSchema), z.lazy(() => AnatomyPartScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomyPartScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomyPartScalarWhereInputSchema), z.lazy(() => AnatomyPartScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  partId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  latinName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  meshName: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  system: z.union([ z.lazy(() => EnumAnatomySystemFilterSchema), z.lazy(() => AnatomySystemSchema) ]).optional(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  modelPath: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  lodLevels: z.lazy(() => JsonNullableFilterSchema).optional(),
  boundingBox: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const AnatomySynonymUpsertWithWhereUniqueWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUpsertWithWhereUniqueWithoutPartInput> = z.object({
  where: z.lazy(() => AnatomySynonymWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AnatomySynonymUpdateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedUpdateWithoutPartInputSchema) ]),
  create: z.union([ z.lazy(() => AnatomySynonymCreateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedCreateWithoutPartInputSchema) ]),
}).strict();

export const AnatomySynonymUpdateWithWhereUniqueWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUpdateWithWhereUniqueWithoutPartInput> = z.object({
  where: z.lazy(() => AnatomySynonymWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AnatomySynonymUpdateWithoutPartInputSchema), z.lazy(() => AnatomySynonymUncheckedUpdateWithoutPartInputSchema) ]),
}).strict();

export const AnatomySynonymUpdateManyWithWhereWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUpdateManyWithWhereWithoutPartInput> = z.object({
  where: z.lazy(() => AnatomySynonymScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AnatomySynonymUpdateManyMutationInputSchema), z.lazy(() => AnatomySynonymUncheckedUpdateManyWithoutPartInputSchema) ]),
}).strict();

export const AnatomySynonymScalarWhereInputSchema: z.ZodType<Prisma.AnatomySynonymScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnatomySynonymScalarWhereInputSchema), z.lazy(() => AnatomySynonymScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnatomySynonymScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnatomySynonymScalarWhereInputSchema), z.lazy(() => AnatomySynonymScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  partId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  synonym: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  language: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  priority: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
}).strict();

export const AnatomyPartCreateWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartCreateWithoutSynonymsInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  parent: z.lazy(() => AnatomyPartCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => AnatomyPartCreateNestedManyWithoutParentInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedCreateWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedCreateWithoutSynonymsInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  parentId: z.string().optional().nullable(),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => AnatomyPartUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
}).strict();

export const AnatomyPartCreateOrConnectWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartCreateOrConnectWithoutSynonymsInput> = z.object({
  where: z.lazy(() => AnatomyPartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutSynonymsInputSchema) ]),
}).strict();

export const AnatomyPartUpsertWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartUpsertWithoutSynonymsInput> = z.object({
  update: z.union([ z.lazy(() => AnatomyPartUpdateWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutSynonymsInputSchema) ]),
  create: z.union([ z.lazy(() => AnatomyPartCreateWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUncheckedCreateWithoutSynonymsInputSchema) ]),
  where: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
}).strict();

export const AnatomyPartUpdateToOneWithWhereWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartUpdateToOneWithWhereWithoutSynonymsInput> = z.object({
  where: z.lazy(() => AnatomyPartWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AnatomyPartUpdateWithoutSynonymsInputSchema), z.lazy(() => AnatomyPartUncheckedUpdateWithoutSynonymsInputSchema) ]),
}).strict();

export const AnatomyPartUpdateWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartUpdateWithoutSynonymsInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  parent: z.lazy(() => AnatomyPartUpdateOneWithoutChildrenNestedInputSchema).optional(),
  children: z.lazy(() => AnatomyPartUpdateManyWithoutParentNestedInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedUpdateWithoutSynonymsInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedUpdateWithoutSynonymsInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  parentId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => AnatomyPartUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
}).strict();

export const SessionNoteCreateWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteCreateWithoutSessionInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date().optional(),
}).strict();

export const SessionNoteUncheckedCreateWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUncheckedCreateWithoutSessionInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date().optional(),
}).strict();

export const SessionNoteCreateOrConnectWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteCreateOrConnectWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionNoteWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionNoteCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema) ]),
}).strict();

export const SessionNoteCreateManySessionInputEnvelopeSchema: z.ZodType<Prisma.SessionNoteCreateManySessionInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionNoteCreateManySessionInputSchema), z.lazy(() => SessionNoteCreateManySessionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const SessionStudentCreateWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentCreateWithoutSessionInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  joinedAt: z.coerce.date().optional(),
}).strict();

export const SessionStudentUncheckedCreateWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUncheckedCreateWithoutSessionInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  joinedAt: z.coerce.date().optional(),
}).strict();

export const SessionStudentCreateOrConnectWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentCreateOrConnectWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionStudentWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SessionStudentCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema) ]),
}).strict();

export const SessionStudentCreateManySessionInputEnvelopeSchema: z.ZodType<Prisma.SessionStudentCreateManySessionInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SessionStudentCreateManySessionInputSchema), z.lazy(() => SessionStudentCreateManySessionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VoiceCommandCreateWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandCreateWithoutSessionInput> = z.object({
  id: z.cuid().optional(),
  transcript: z.string(),
  intent: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  target: z.string().optional().nullable(),
  confidence: z.number().optional().nullable(),
  success: z.boolean().optional(),
  errorMsg: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
}).strict();

export const VoiceCommandUncheckedCreateWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedCreateWithoutSessionInput> = z.object({
  id: z.cuid().optional(),
  transcript: z.string(),
  intent: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  target: z.string().optional().nullable(),
  confidence: z.number().optional().nullable(),
  success: z.boolean().optional(),
  errorMsg: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
}).strict();

export const VoiceCommandCreateOrConnectWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandCreateOrConnectWithoutSessionInput> = z.object({
  where: z.lazy(() => VoiceCommandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema) ]),
}).strict();

export const VoiceCommandCreateManySessionInputEnvelopeSchema: z.ZodType<Prisma.VoiceCommandCreateManySessionInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => VoiceCommandCreateManySessionInputSchema), z.lazy(() => VoiceCommandCreateManySessionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const SessionNoteUpsertWithWhereUniqueWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUpsertWithWhereUniqueWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionNoteWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionNoteUpdateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedUpdateWithoutSessionInputSchema) ]),
  create: z.union([ z.lazy(() => SessionNoteCreateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedCreateWithoutSessionInputSchema) ]),
}).strict();

export const SessionNoteUpdateWithWhereUniqueWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUpdateWithWhereUniqueWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionNoteWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionNoteUpdateWithoutSessionInputSchema), z.lazy(() => SessionNoteUncheckedUpdateWithoutSessionInputSchema) ]),
}).strict();

export const SessionNoteUpdateManyWithWhereWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUpdateManyWithWhereWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionNoteScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionNoteUpdateManyMutationInputSchema), z.lazy(() => SessionNoteUncheckedUpdateManyWithoutSessionInputSchema) ]),
}).strict();

export const SessionNoteScalarWhereInputSchema: z.ZodType<Prisma.SessionNoteScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionNoteScalarWhereInputSchema), z.lazy(() => SessionNoteScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionNoteScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionNoteScalarWhereInputSchema), z.lazy(() => SessionNoteScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const SessionStudentUpsertWithWhereUniqueWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUpsertWithWhereUniqueWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionStudentWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => SessionStudentUpdateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedUpdateWithoutSessionInputSchema) ]),
  create: z.union([ z.lazy(() => SessionStudentCreateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedCreateWithoutSessionInputSchema) ]),
}).strict();

export const SessionStudentUpdateWithWhereUniqueWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUpdateWithWhereUniqueWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionStudentWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => SessionStudentUpdateWithoutSessionInputSchema), z.lazy(() => SessionStudentUncheckedUpdateWithoutSessionInputSchema) ]),
}).strict();

export const SessionStudentUpdateManyWithWhereWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUpdateManyWithWhereWithoutSessionInput> = z.object({
  where: z.lazy(() => SessionStudentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SessionStudentUpdateManyMutationInputSchema), z.lazy(() => SessionStudentUncheckedUpdateManyWithoutSessionInputSchema) ]),
}).strict();

export const SessionStudentScalarWhereInputSchema: z.ZodType<Prisma.SessionStudentScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionStudentScalarWhereInputSchema), z.lazy(() => SessionStudentScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionStudentScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionStudentScalarWhereInputSchema), z.lazy(() => SessionStudentScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  studentId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  joinedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const VoiceCommandUpsertWithWhereUniqueWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUpsertWithWhereUniqueWithoutSessionInput> = z.object({
  where: z.lazy(() => VoiceCommandWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => VoiceCommandUpdateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedUpdateWithoutSessionInputSchema) ]),
  create: z.union([ z.lazy(() => VoiceCommandCreateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedCreateWithoutSessionInputSchema) ]),
}).strict();

export const VoiceCommandUpdateWithWhereUniqueWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUpdateWithWhereUniqueWithoutSessionInput> = z.object({
  where: z.lazy(() => VoiceCommandWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => VoiceCommandUpdateWithoutSessionInputSchema), z.lazy(() => VoiceCommandUncheckedUpdateWithoutSessionInputSchema) ]),
}).strict();

export const VoiceCommandUpdateManyWithWhereWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUpdateManyWithWhereWithoutSessionInput> = z.object({
  where: z.lazy(() => VoiceCommandScalarWhereInputSchema),
  data: z.union([ z.lazy(() => VoiceCommandUpdateManyMutationInputSchema), z.lazy(() => VoiceCommandUncheckedUpdateManyWithoutSessionInputSchema) ]),
}).strict();

export const VoiceCommandScalarWhereInputSchema: z.ZodType<Prisma.VoiceCommandScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => VoiceCommandScalarWhereInputSchema), z.lazy(() => VoiceCommandScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => VoiceCommandScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => VoiceCommandScalarWhereInputSchema), z.lazy(() => VoiceCommandScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  transcript: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  intent: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  action: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  target: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  confidence: z.union([ z.lazy(() => FloatNullableFilterSchema), z.number() ]).optional().nullable(),
  success: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  errorMsg: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export const TeachingSessionCreateWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionCreateWithoutStudentsInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  notes: z.lazy(() => SessionNoteCreateNestedManyWithoutSessionInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedCreateWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedCreateWithoutStudentsInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  notes: z.lazy(() => SessionNoteUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionCreateOrConnectWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionCreateOrConnectWithoutStudentsInput> = z.object({
  where: z.lazy(() => TeachingSessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutStudentsInputSchema) ]),
}).strict();

export const TeachingSessionUpsertWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionUpsertWithoutStudentsInput> = z.object({
  update: z.union([ z.lazy(() => TeachingSessionUpdateWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutStudentsInputSchema) ]),
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutStudentsInputSchema) ]),
  where: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
}).strict();

export const TeachingSessionUpdateToOneWithWhereWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionUpdateToOneWithWhereWithoutStudentsInput> = z.object({
  where: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TeachingSessionUpdateWithoutStudentsInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutStudentsInputSchema) ]),
}).strict();

export const TeachingSessionUpdateWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionUpdateWithoutStudentsInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteUpdateManyWithoutSessionNestedInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedUpdateWithoutStudentsInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedUpdateWithoutStudentsInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const TeachingSessionCreateWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionCreateWithoutNotesInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  students: z.lazy(() => SessionStudentCreateNestedManyWithoutSessionInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedCreateWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedCreateWithoutNotesInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  students: z.lazy(() => SessionStudentUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionCreateOrConnectWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionCreateOrConnectWithoutNotesInput> = z.object({
  where: z.lazy(() => TeachingSessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutNotesInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutNotesInputSchema) ]),
}).strict();

export const TeachingSessionUpsertWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionUpsertWithoutNotesInput> = z.object({
  update: z.union([ z.lazy(() => TeachingSessionUpdateWithoutNotesInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutNotesInputSchema) ]),
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutNotesInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutNotesInputSchema) ]),
  where: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
}).strict();

export const TeachingSessionUpdateToOneWithWhereWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionUpdateToOneWithWhereWithoutNotesInput> = z.object({
  where: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TeachingSessionUpdateWithoutNotesInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutNotesInputSchema) ]),
}).strict();

export const TeachingSessionUpdateWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionUpdateWithoutNotesInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  students: z.lazy(() => SessionStudentUpdateManyWithoutSessionNestedInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedUpdateWithoutNotesInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedUpdateWithoutNotesInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  students: z.lazy(() => SessionStudentUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
  commands: z.lazy(() => VoiceCommandUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const TeachingSessionCreateWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionCreateWithoutCommandsInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  notes: z.lazy(() => SessionNoteCreateNestedManyWithoutSessionInputSchema).optional(),
  students: z.lazy(() => SessionStudentCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedCreateWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedCreateWithoutCommandsInput> = z.object({
  id: z.cuid().optional(),
  code: z.string(),
  teacherId: z.string(),
  title: z.string(),
  isActive: z.boolean().optional(),
  highlightedPart: z.string().optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionCreatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional().nullable(),
  notes: z.lazy(() => SessionNoteUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
  students: z.lazy(() => SessionStudentUncheckedCreateNestedManyWithoutSessionInputSchema).optional(),
}).strict();

export const TeachingSessionCreateOrConnectWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionCreateOrConnectWithoutCommandsInput> = z.object({
  where: z.lazy(() => TeachingSessionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutCommandsInputSchema) ]),
}).strict();

export const TeachingSessionUpsertWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionUpsertWithoutCommandsInput> = z.object({
  update: z.union([ z.lazy(() => TeachingSessionUpdateWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutCommandsInputSchema) ]),
  create: z.union([ z.lazy(() => TeachingSessionCreateWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUncheckedCreateWithoutCommandsInputSchema) ]),
  where: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
}).strict();

export const TeachingSessionUpdateToOneWithWhereWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionUpdateToOneWithWhereWithoutCommandsInput> = z.object({
  where: z.lazy(() => TeachingSessionWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TeachingSessionUpdateWithoutCommandsInputSchema), z.lazy(() => TeachingSessionUncheckedUpdateWithoutCommandsInputSchema) ]),
}).strict();

export const TeachingSessionUpdateWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionUpdateWithoutCommandsInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteUpdateManyWithoutSessionNestedInputSchema).optional(),
  students: z.lazy(() => SessionStudentUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const TeachingSessionUncheckedUpdateWithoutCommandsInputSchema: z.ZodType<Prisma.TeachingSessionUncheckedUpdateWithoutCommandsInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  code: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  teacherId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isActive: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  highlightedPart: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  cameraPosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  modelRotation: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  visibleSystems: z.union([ z.lazy(() => TeachingSessionUpdatevisibleSystemsInputSchema), z.string().array() ]).optional(),
  slicePosition: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  endedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  notes: z.lazy(() => SessionNoteUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
  students: z.lazy(() => SessionStudentUncheckedUpdateManyWithoutSessionNestedInputSchema).optional(),
}).strict();

export const AnatomyPartCreateManyParentInputSchema: z.ZodType<Prisma.AnatomyPartCreateManyParentInput> = z.object({
  id: z.cuid().optional(),
  partId: z.string(),
  name: z.string(),
  latinName: z.string().optional().nullable(),
  meshName: z.string().optional().nullable(),
  system: z.lazy(() => AnatomySystemSchema),
  modelPath: z.string().optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export const AnatomySynonymCreateManyPartInputSchema: z.ZodType<Prisma.AnatomySynonymCreateManyPartInput> = z.object({
  id: z.cuid().optional(),
  synonym: z.string(),
  language: z.string().optional(),
  priority: z.number().int().optional(),
}).strict();

export const AnatomyPartUpdateWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUpdateWithoutParentInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => AnatomyPartUpdateManyWithoutParentNestedInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymUpdateManyWithoutPartNestedInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedUpdateWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedUpdateWithoutParentInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  children: z.lazy(() => AnatomyPartUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
  synonyms: z.lazy(() => AnatomySynonymUncheckedUpdateManyWithoutPartNestedInputSchema).optional(),
}).strict();

export const AnatomyPartUncheckedUpdateManyWithoutParentInputSchema: z.ZodType<Prisma.AnatomyPartUncheckedUpdateManyWithoutParentInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  partId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latinName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  meshName: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  system: z.union([ z.lazy(() => AnatomySystemSchema), z.lazy(() => EnumAnatomySystemFieldUpdateOperationsInputSchema) ]).optional(),
  modelPath: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  lodLevels: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  boundingBox: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnatomySynonymUpdateWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUpdateWithoutPartInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  synonym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  language: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnatomySynonymUncheckedUpdateWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedUpdateWithoutPartInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  synonym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  language: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnatomySynonymUncheckedUpdateManyWithoutPartInputSchema: z.ZodType<Prisma.AnatomySynonymUncheckedUpdateManyWithoutPartInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  synonym: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  language: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionNoteCreateManySessionInputSchema: z.ZodType<Prisma.SessionNoteCreateManySessionInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  content: z.string(),
  timestamp: z.coerce.date().optional(),
}).strict();

export const SessionStudentCreateManySessionInputSchema: z.ZodType<Prisma.SessionStudentCreateManySessionInput> = z.object({
  id: z.cuid().optional(),
  studentId: z.string(),
  joinedAt: z.coerce.date().optional(),
}).strict();

export const VoiceCommandCreateManySessionInputSchema: z.ZodType<Prisma.VoiceCommandCreateManySessionInput> = z.object({
  id: z.cuid().optional(),
  transcript: z.string(),
  intent: z.string().optional().nullable(),
  action: z.string().optional().nullable(),
  target: z.string().optional().nullable(),
  confidence: z.number().optional().nullable(),
  success: z.boolean().optional(),
  errorMsg: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
}).strict();

export const SessionNoteUpdateWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUpdateWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionNoteUncheckedUpdateWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUncheckedUpdateWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionNoteUncheckedUpdateManyWithoutSessionInputSchema: z.ZodType<Prisma.SessionNoteUncheckedUpdateManyWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionStudentUpdateWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUpdateWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionStudentUncheckedUpdateWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUncheckedUpdateWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionStudentUncheckedUpdateManyWithoutSessionInputSchema: z.ZodType<Prisma.SessionStudentUncheckedUpdateManyWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  studentId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  joinedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VoiceCommandUpdateWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUpdateWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  transcript: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  intent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  action: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  confidence: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  success: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  errorMsg: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VoiceCommandUncheckedUpdateWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedUpdateWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  transcript: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  intent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  action: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  confidence: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  success: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  errorMsg: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const VoiceCommandUncheckedUpdateManyWithoutSessionInputSchema: z.ZodType<Prisma.VoiceCommandUncheckedUpdateManyWithoutSessionInput> = z.object({
  id: z.union([ z.cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  transcript: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  intent: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  action: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  target: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  confidence: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  success: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  errorMsg: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const AnatomyPartFindFirstArgsSchema: z.ZodType<Prisma.AnatomyPartFindFirstArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  where: AnatomyPartWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomyPartOrderByWithRelationInputSchema.array(), AnatomyPartOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomyPartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnatomyPartScalarFieldEnumSchema, AnatomyPartScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AnatomyPartFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AnatomyPartFindFirstOrThrowArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  where: AnatomyPartWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomyPartOrderByWithRelationInputSchema.array(), AnatomyPartOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomyPartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnatomyPartScalarFieldEnumSchema, AnatomyPartScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AnatomyPartFindManyArgsSchema: z.ZodType<Prisma.AnatomyPartFindManyArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  where: AnatomyPartWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomyPartOrderByWithRelationInputSchema.array(), AnatomyPartOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomyPartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnatomyPartScalarFieldEnumSchema, AnatomyPartScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AnatomyPartAggregateArgsSchema: z.ZodType<Prisma.AnatomyPartAggregateArgs> = z.object({
  where: AnatomyPartWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomyPartOrderByWithRelationInputSchema.array(), AnatomyPartOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomyPartWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AnatomyPartGroupByArgsSchema: z.ZodType<Prisma.AnatomyPartGroupByArgs> = z.object({
  where: AnatomyPartWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomyPartOrderByWithAggregationInputSchema.array(), AnatomyPartOrderByWithAggregationInputSchema ]).optional(),
  by: AnatomyPartScalarFieldEnumSchema.array(), 
  having: AnatomyPartScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AnatomyPartFindUniqueArgsSchema: z.ZodType<Prisma.AnatomyPartFindUniqueArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  where: AnatomyPartWhereUniqueInputSchema, 
}).strict();

export const AnatomyPartFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AnatomyPartFindUniqueOrThrowArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  where: AnatomyPartWhereUniqueInputSchema, 
}).strict();

export const AnatomySynonymFindFirstArgsSchema: z.ZodType<Prisma.AnatomySynonymFindFirstArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  where: AnatomySynonymWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomySynonymOrderByWithRelationInputSchema.array(), AnatomySynonymOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomySynonymWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnatomySynonymScalarFieldEnumSchema, AnatomySynonymScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AnatomySynonymFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AnatomySynonymFindFirstOrThrowArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  where: AnatomySynonymWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomySynonymOrderByWithRelationInputSchema.array(), AnatomySynonymOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomySynonymWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnatomySynonymScalarFieldEnumSchema, AnatomySynonymScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AnatomySynonymFindManyArgsSchema: z.ZodType<Prisma.AnatomySynonymFindManyArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  where: AnatomySynonymWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomySynonymOrderByWithRelationInputSchema.array(), AnatomySynonymOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomySynonymWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnatomySynonymScalarFieldEnumSchema, AnatomySynonymScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const AnatomySynonymAggregateArgsSchema: z.ZodType<Prisma.AnatomySynonymAggregateArgs> = z.object({
  where: AnatomySynonymWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomySynonymOrderByWithRelationInputSchema.array(), AnatomySynonymOrderByWithRelationInputSchema ]).optional(),
  cursor: AnatomySynonymWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AnatomySynonymGroupByArgsSchema: z.ZodType<Prisma.AnatomySynonymGroupByArgs> = z.object({
  where: AnatomySynonymWhereInputSchema.optional(), 
  orderBy: z.union([ AnatomySynonymOrderByWithAggregationInputSchema.array(), AnatomySynonymOrderByWithAggregationInputSchema ]).optional(),
  by: AnatomySynonymScalarFieldEnumSchema.array(), 
  having: AnatomySynonymScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const AnatomySynonymFindUniqueArgsSchema: z.ZodType<Prisma.AnatomySynonymFindUniqueArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  where: AnatomySynonymWhereUniqueInputSchema, 
}).strict();

export const AnatomySynonymFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AnatomySynonymFindUniqueOrThrowArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  where: AnatomySynonymWhereUniqueInputSchema, 
}).strict();

export const TeachingSessionFindFirstArgsSchema: z.ZodType<Prisma.TeachingSessionFindFirstArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  where: TeachingSessionWhereInputSchema.optional(), 
  orderBy: z.union([ TeachingSessionOrderByWithRelationInputSchema.array(), TeachingSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TeachingSessionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TeachingSessionScalarFieldEnumSchema, TeachingSessionScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TeachingSessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TeachingSessionFindFirstOrThrowArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  where: TeachingSessionWhereInputSchema.optional(), 
  orderBy: z.union([ TeachingSessionOrderByWithRelationInputSchema.array(), TeachingSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TeachingSessionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TeachingSessionScalarFieldEnumSchema, TeachingSessionScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TeachingSessionFindManyArgsSchema: z.ZodType<Prisma.TeachingSessionFindManyArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  where: TeachingSessionWhereInputSchema.optional(), 
  orderBy: z.union([ TeachingSessionOrderByWithRelationInputSchema.array(), TeachingSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TeachingSessionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TeachingSessionScalarFieldEnumSchema, TeachingSessionScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TeachingSessionAggregateArgsSchema: z.ZodType<Prisma.TeachingSessionAggregateArgs> = z.object({
  where: TeachingSessionWhereInputSchema.optional(), 
  orderBy: z.union([ TeachingSessionOrderByWithRelationInputSchema.array(), TeachingSessionOrderByWithRelationInputSchema ]).optional(),
  cursor: TeachingSessionWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const TeachingSessionGroupByArgsSchema: z.ZodType<Prisma.TeachingSessionGroupByArgs> = z.object({
  where: TeachingSessionWhereInputSchema.optional(), 
  orderBy: z.union([ TeachingSessionOrderByWithAggregationInputSchema.array(), TeachingSessionOrderByWithAggregationInputSchema ]).optional(),
  by: TeachingSessionScalarFieldEnumSchema.array(), 
  having: TeachingSessionScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const TeachingSessionFindUniqueArgsSchema: z.ZodType<Prisma.TeachingSessionFindUniqueArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  where: TeachingSessionWhereUniqueInputSchema, 
}).strict();

export const TeachingSessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TeachingSessionFindUniqueOrThrowArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  where: TeachingSessionWhereUniqueInputSchema, 
}).strict();

export const SessionStudentFindFirstArgsSchema: z.ZodType<Prisma.SessionStudentFindFirstArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  where: SessionStudentWhereInputSchema.optional(), 
  orderBy: z.union([ SessionStudentOrderByWithRelationInputSchema.array(), SessionStudentOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionStudentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionStudentScalarFieldEnumSchema, SessionStudentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const SessionStudentFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionStudentFindFirstOrThrowArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  where: SessionStudentWhereInputSchema.optional(), 
  orderBy: z.union([ SessionStudentOrderByWithRelationInputSchema.array(), SessionStudentOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionStudentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionStudentScalarFieldEnumSchema, SessionStudentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const SessionStudentFindManyArgsSchema: z.ZodType<Prisma.SessionStudentFindManyArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  where: SessionStudentWhereInputSchema.optional(), 
  orderBy: z.union([ SessionStudentOrderByWithRelationInputSchema.array(), SessionStudentOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionStudentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionStudentScalarFieldEnumSchema, SessionStudentScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const SessionStudentAggregateArgsSchema: z.ZodType<Prisma.SessionStudentAggregateArgs> = z.object({
  where: SessionStudentWhereInputSchema.optional(), 
  orderBy: z.union([ SessionStudentOrderByWithRelationInputSchema.array(), SessionStudentOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionStudentWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const SessionStudentGroupByArgsSchema: z.ZodType<Prisma.SessionStudentGroupByArgs> = z.object({
  where: SessionStudentWhereInputSchema.optional(), 
  orderBy: z.union([ SessionStudentOrderByWithAggregationInputSchema.array(), SessionStudentOrderByWithAggregationInputSchema ]).optional(),
  by: SessionStudentScalarFieldEnumSchema.array(), 
  having: SessionStudentScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const SessionStudentFindUniqueArgsSchema: z.ZodType<Prisma.SessionStudentFindUniqueArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  where: SessionStudentWhereUniqueInputSchema, 
}).strict();

export const SessionStudentFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionStudentFindUniqueOrThrowArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  where: SessionStudentWhereUniqueInputSchema, 
}).strict();

export const SessionNoteFindFirstArgsSchema: z.ZodType<Prisma.SessionNoteFindFirstArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  where: SessionNoteWhereInputSchema.optional(), 
  orderBy: z.union([ SessionNoteOrderByWithRelationInputSchema.array(), SessionNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionNoteScalarFieldEnumSchema, SessionNoteScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const SessionNoteFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionNoteFindFirstOrThrowArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  where: SessionNoteWhereInputSchema.optional(), 
  orderBy: z.union([ SessionNoteOrderByWithRelationInputSchema.array(), SessionNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionNoteScalarFieldEnumSchema, SessionNoteScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const SessionNoteFindManyArgsSchema: z.ZodType<Prisma.SessionNoteFindManyArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  where: SessionNoteWhereInputSchema.optional(), 
  orderBy: z.union([ SessionNoteOrderByWithRelationInputSchema.array(), SessionNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionNoteScalarFieldEnumSchema, SessionNoteScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const SessionNoteAggregateArgsSchema: z.ZodType<Prisma.SessionNoteAggregateArgs> = z.object({
  where: SessionNoteWhereInputSchema.optional(), 
  orderBy: z.union([ SessionNoteOrderByWithRelationInputSchema.array(), SessionNoteOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionNoteWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const SessionNoteGroupByArgsSchema: z.ZodType<Prisma.SessionNoteGroupByArgs> = z.object({
  where: SessionNoteWhereInputSchema.optional(), 
  orderBy: z.union([ SessionNoteOrderByWithAggregationInputSchema.array(), SessionNoteOrderByWithAggregationInputSchema ]).optional(),
  by: SessionNoteScalarFieldEnumSchema.array(), 
  having: SessionNoteScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const SessionNoteFindUniqueArgsSchema: z.ZodType<Prisma.SessionNoteFindUniqueArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  where: SessionNoteWhereUniqueInputSchema, 
}).strict();

export const SessionNoteFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionNoteFindUniqueOrThrowArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  where: SessionNoteWhereUniqueInputSchema, 
}).strict();

export const VoiceCommandFindFirstArgsSchema: z.ZodType<Prisma.VoiceCommandFindFirstArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  where: VoiceCommandWhereInputSchema.optional(), 
  orderBy: z.union([ VoiceCommandOrderByWithRelationInputSchema.array(), VoiceCommandOrderByWithRelationInputSchema ]).optional(),
  cursor: VoiceCommandWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoiceCommandScalarFieldEnumSchema, VoiceCommandScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoiceCommandFindFirstOrThrowArgsSchema: z.ZodType<Prisma.VoiceCommandFindFirstOrThrowArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  where: VoiceCommandWhereInputSchema.optional(), 
  orderBy: z.union([ VoiceCommandOrderByWithRelationInputSchema.array(), VoiceCommandOrderByWithRelationInputSchema ]).optional(),
  cursor: VoiceCommandWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoiceCommandScalarFieldEnumSchema, VoiceCommandScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoiceCommandFindManyArgsSchema: z.ZodType<Prisma.VoiceCommandFindManyArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  where: VoiceCommandWhereInputSchema.optional(), 
  orderBy: z.union([ VoiceCommandOrderByWithRelationInputSchema.array(), VoiceCommandOrderByWithRelationInputSchema ]).optional(),
  cursor: VoiceCommandWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VoiceCommandScalarFieldEnumSchema, VoiceCommandScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const VoiceCommandAggregateArgsSchema: z.ZodType<Prisma.VoiceCommandAggregateArgs> = z.object({
  where: VoiceCommandWhereInputSchema.optional(), 
  orderBy: z.union([ VoiceCommandOrderByWithRelationInputSchema.array(), VoiceCommandOrderByWithRelationInputSchema ]).optional(),
  cursor: VoiceCommandWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VoiceCommandGroupByArgsSchema: z.ZodType<Prisma.VoiceCommandGroupByArgs> = z.object({
  where: VoiceCommandWhereInputSchema.optional(), 
  orderBy: z.union([ VoiceCommandOrderByWithAggregationInputSchema.array(), VoiceCommandOrderByWithAggregationInputSchema ]).optional(),
  by: VoiceCommandScalarFieldEnumSchema.array(), 
  having: VoiceCommandScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const VoiceCommandFindUniqueArgsSchema: z.ZodType<Prisma.VoiceCommandFindUniqueArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  where: VoiceCommandWhereUniqueInputSchema, 
}).strict();

export const VoiceCommandFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.VoiceCommandFindUniqueOrThrowArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  where: VoiceCommandWhereUniqueInputSchema, 
}).strict();

export const AnatomyPartCreateArgsSchema: z.ZodType<Prisma.AnatomyPartCreateArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  data: z.union([ AnatomyPartCreateInputSchema, AnatomyPartUncheckedCreateInputSchema ]),
}).strict();

export const AnatomyPartUpsertArgsSchema: z.ZodType<Prisma.AnatomyPartUpsertArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  where: AnatomyPartWhereUniqueInputSchema, 
  create: z.union([ AnatomyPartCreateInputSchema, AnatomyPartUncheckedCreateInputSchema ]),
  update: z.union([ AnatomyPartUpdateInputSchema, AnatomyPartUncheckedUpdateInputSchema ]),
}).strict();

export const AnatomyPartCreateManyArgsSchema: z.ZodType<Prisma.AnatomyPartCreateManyArgs> = z.object({
  data: z.union([ AnatomyPartCreateManyInputSchema, AnatomyPartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AnatomyPartCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AnatomyPartCreateManyAndReturnArgs> = z.object({
  data: z.union([ AnatomyPartCreateManyInputSchema, AnatomyPartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AnatomyPartDeleteArgsSchema: z.ZodType<Prisma.AnatomyPartDeleteArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  where: AnatomyPartWhereUniqueInputSchema, 
}).strict();

export const AnatomyPartUpdateArgsSchema: z.ZodType<Prisma.AnatomyPartUpdateArgs> = z.object({
  select: AnatomyPartSelectSchema.optional(),
  include: AnatomyPartIncludeSchema.optional(),
  data: z.union([ AnatomyPartUpdateInputSchema, AnatomyPartUncheckedUpdateInputSchema ]),
  where: AnatomyPartWhereUniqueInputSchema, 
}).strict();

export const AnatomyPartUpdateManyArgsSchema: z.ZodType<Prisma.AnatomyPartUpdateManyArgs> = z.object({
  data: z.union([ AnatomyPartUpdateManyMutationInputSchema, AnatomyPartUncheckedUpdateManyInputSchema ]),
  where: AnatomyPartWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AnatomyPartUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AnatomyPartUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AnatomyPartUpdateManyMutationInputSchema, AnatomyPartUncheckedUpdateManyInputSchema ]),
  where: AnatomyPartWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AnatomyPartDeleteManyArgsSchema: z.ZodType<Prisma.AnatomyPartDeleteManyArgs> = z.object({
  where: AnatomyPartWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AnatomySynonymCreateArgsSchema: z.ZodType<Prisma.AnatomySynonymCreateArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  data: z.union([ AnatomySynonymCreateInputSchema, AnatomySynonymUncheckedCreateInputSchema ]),
}).strict();

export const AnatomySynonymUpsertArgsSchema: z.ZodType<Prisma.AnatomySynonymUpsertArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  where: AnatomySynonymWhereUniqueInputSchema, 
  create: z.union([ AnatomySynonymCreateInputSchema, AnatomySynonymUncheckedCreateInputSchema ]),
  update: z.union([ AnatomySynonymUpdateInputSchema, AnatomySynonymUncheckedUpdateInputSchema ]),
}).strict();

export const AnatomySynonymCreateManyArgsSchema: z.ZodType<Prisma.AnatomySynonymCreateManyArgs> = z.object({
  data: z.union([ AnatomySynonymCreateManyInputSchema, AnatomySynonymCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AnatomySynonymCreateManyAndReturnArgsSchema: z.ZodType<Prisma.AnatomySynonymCreateManyAndReturnArgs> = z.object({
  data: z.union([ AnatomySynonymCreateManyInputSchema, AnatomySynonymCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const AnatomySynonymDeleteArgsSchema: z.ZodType<Prisma.AnatomySynonymDeleteArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  where: AnatomySynonymWhereUniqueInputSchema, 
}).strict();

export const AnatomySynonymUpdateArgsSchema: z.ZodType<Prisma.AnatomySynonymUpdateArgs> = z.object({
  select: AnatomySynonymSelectSchema.optional(),
  include: AnatomySynonymIncludeSchema.optional(),
  data: z.union([ AnatomySynonymUpdateInputSchema, AnatomySynonymUncheckedUpdateInputSchema ]),
  where: AnatomySynonymWhereUniqueInputSchema, 
}).strict();

export const AnatomySynonymUpdateManyArgsSchema: z.ZodType<Prisma.AnatomySynonymUpdateManyArgs> = z.object({
  data: z.union([ AnatomySynonymUpdateManyMutationInputSchema, AnatomySynonymUncheckedUpdateManyInputSchema ]),
  where: AnatomySynonymWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AnatomySynonymUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AnatomySynonymUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AnatomySynonymUpdateManyMutationInputSchema, AnatomySynonymUncheckedUpdateManyInputSchema ]),
  where: AnatomySynonymWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const AnatomySynonymDeleteManyArgsSchema: z.ZodType<Prisma.AnatomySynonymDeleteManyArgs> = z.object({
  where: AnatomySynonymWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TeachingSessionCreateArgsSchema: z.ZodType<Prisma.TeachingSessionCreateArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  data: z.union([ TeachingSessionCreateInputSchema, TeachingSessionUncheckedCreateInputSchema ]),
}).strict();

export const TeachingSessionUpsertArgsSchema: z.ZodType<Prisma.TeachingSessionUpsertArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  where: TeachingSessionWhereUniqueInputSchema, 
  create: z.union([ TeachingSessionCreateInputSchema, TeachingSessionUncheckedCreateInputSchema ]),
  update: z.union([ TeachingSessionUpdateInputSchema, TeachingSessionUncheckedUpdateInputSchema ]),
}).strict();

export const TeachingSessionCreateManyArgsSchema: z.ZodType<Prisma.TeachingSessionCreateManyArgs> = z.object({
  data: z.union([ TeachingSessionCreateManyInputSchema, TeachingSessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const TeachingSessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TeachingSessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ TeachingSessionCreateManyInputSchema, TeachingSessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const TeachingSessionDeleteArgsSchema: z.ZodType<Prisma.TeachingSessionDeleteArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  where: TeachingSessionWhereUniqueInputSchema, 
}).strict();

export const TeachingSessionUpdateArgsSchema: z.ZodType<Prisma.TeachingSessionUpdateArgs> = z.object({
  select: TeachingSessionSelectSchema.optional(),
  include: TeachingSessionIncludeSchema.optional(),
  data: z.union([ TeachingSessionUpdateInputSchema, TeachingSessionUncheckedUpdateInputSchema ]),
  where: TeachingSessionWhereUniqueInputSchema, 
}).strict();

export const TeachingSessionUpdateManyArgsSchema: z.ZodType<Prisma.TeachingSessionUpdateManyArgs> = z.object({
  data: z.union([ TeachingSessionUpdateManyMutationInputSchema, TeachingSessionUncheckedUpdateManyInputSchema ]),
  where: TeachingSessionWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TeachingSessionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TeachingSessionUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TeachingSessionUpdateManyMutationInputSchema, TeachingSessionUncheckedUpdateManyInputSchema ]),
  where: TeachingSessionWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TeachingSessionDeleteManyArgsSchema: z.ZodType<Prisma.TeachingSessionDeleteManyArgs> = z.object({
  where: TeachingSessionWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const SessionStudentCreateArgsSchema: z.ZodType<Prisma.SessionStudentCreateArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  data: z.union([ SessionStudentCreateInputSchema, SessionStudentUncheckedCreateInputSchema ]),
}).strict();

export const SessionStudentUpsertArgsSchema: z.ZodType<Prisma.SessionStudentUpsertArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  where: SessionStudentWhereUniqueInputSchema, 
  create: z.union([ SessionStudentCreateInputSchema, SessionStudentUncheckedCreateInputSchema ]),
  update: z.union([ SessionStudentUpdateInputSchema, SessionStudentUncheckedUpdateInputSchema ]),
}).strict();

export const SessionStudentCreateManyArgsSchema: z.ZodType<Prisma.SessionStudentCreateManyArgs> = z.object({
  data: z.union([ SessionStudentCreateManyInputSchema, SessionStudentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const SessionStudentCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionStudentCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionStudentCreateManyInputSchema, SessionStudentCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const SessionStudentDeleteArgsSchema: z.ZodType<Prisma.SessionStudentDeleteArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  where: SessionStudentWhereUniqueInputSchema, 
}).strict();

export const SessionStudentUpdateArgsSchema: z.ZodType<Prisma.SessionStudentUpdateArgs> = z.object({
  select: SessionStudentSelectSchema.optional(),
  include: SessionStudentIncludeSchema.optional(),
  data: z.union([ SessionStudentUpdateInputSchema, SessionStudentUncheckedUpdateInputSchema ]),
  where: SessionStudentWhereUniqueInputSchema, 
}).strict();

export const SessionStudentUpdateManyArgsSchema: z.ZodType<Prisma.SessionStudentUpdateManyArgs> = z.object({
  data: z.union([ SessionStudentUpdateManyMutationInputSchema, SessionStudentUncheckedUpdateManyInputSchema ]),
  where: SessionStudentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const SessionStudentUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionStudentUpdateManyAndReturnArgs> = z.object({
  data: z.union([ SessionStudentUpdateManyMutationInputSchema, SessionStudentUncheckedUpdateManyInputSchema ]),
  where: SessionStudentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const SessionStudentDeleteManyArgsSchema: z.ZodType<Prisma.SessionStudentDeleteManyArgs> = z.object({
  where: SessionStudentWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const SessionNoteCreateArgsSchema: z.ZodType<Prisma.SessionNoteCreateArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  data: z.union([ SessionNoteCreateInputSchema, SessionNoteUncheckedCreateInputSchema ]),
}).strict();

export const SessionNoteUpsertArgsSchema: z.ZodType<Prisma.SessionNoteUpsertArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  where: SessionNoteWhereUniqueInputSchema, 
  create: z.union([ SessionNoteCreateInputSchema, SessionNoteUncheckedCreateInputSchema ]),
  update: z.union([ SessionNoteUpdateInputSchema, SessionNoteUncheckedUpdateInputSchema ]),
}).strict();

export const SessionNoteCreateManyArgsSchema: z.ZodType<Prisma.SessionNoteCreateManyArgs> = z.object({
  data: z.union([ SessionNoteCreateManyInputSchema, SessionNoteCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const SessionNoteCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionNoteCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionNoteCreateManyInputSchema, SessionNoteCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const SessionNoteDeleteArgsSchema: z.ZodType<Prisma.SessionNoteDeleteArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  where: SessionNoteWhereUniqueInputSchema, 
}).strict();

export const SessionNoteUpdateArgsSchema: z.ZodType<Prisma.SessionNoteUpdateArgs> = z.object({
  select: SessionNoteSelectSchema.optional(),
  include: SessionNoteIncludeSchema.optional(),
  data: z.union([ SessionNoteUpdateInputSchema, SessionNoteUncheckedUpdateInputSchema ]),
  where: SessionNoteWhereUniqueInputSchema, 
}).strict();

export const SessionNoteUpdateManyArgsSchema: z.ZodType<Prisma.SessionNoteUpdateManyArgs> = z.object({
  data: z.union([ SessionNoteUpdateManyMutationInputSchema, SessionNoteUncheckedUpdateManyInputSchema ]),
  where: SessionNoteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const SessionNoteUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionNoteUpdateManyAndReturnArgs> = z.object({
  data: z.union([ SessionNoteUpdateManyMutationInputSchema, SessionNoteUncheckedUpdateManyInputSchema ]),
  where: SessionNoteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const SessionNoteDeleteManyArgsSchema: z.ZodType<Prisma.SessionNoteDeleteManyArgs> = z.object({
  where: SessionNoteWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoiceCommandCreateArgsSchema: z.ZodType<Prisma.VoiceCommandCreateArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  data: z.union([ VoiceCommandCreateInputSchema, VoiceCommandUncheckedCreateInputSchema ]),
}).strict();

export const VoiceCommandUpsertArgsSchema: z.ZodType<Prisma.VoiceCommandUpsertArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  where: VoiceCommandWhereUniqueInputSchema, 
  create: z.union([ VoiceCommandCreateInputSchema, VoiceCommandUncheckedCreateInputSchema ]),
  update: z.union([ VoiceCommandUpdateInputSchema, VoiceCommandUncheckedUpdateInputSchema ]),
}).strict();

export const VoiceCommandCreateManyArgsSchema: z.ZodType<Prisma.VoiceCommandCreateManyArgs> = z.object({
  data: z.union([ VoiceCommandCreateManyInputSchema, VoiceCommandCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VoiceCommandCreateManyAndReturnArgsSchema: z.ZodType<Prisma.VoiceCommandCreateManyAndReturnArgs> = z.object({
  data: z.union([ VoiceCommandCreateManyInputSchema, VoiceCommandCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const VoiceCommandDeleteArgsSchema: z.ZodType<Prisma.VoiceCommandDeleteArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  where: VoiceCommandWhereUniqueInputSchema, 
}).strict();

export const VoiceCommandUpdateArgsSchema: z.ZodType<Prisma.VoiceCommandUpdateArgs> = z.object({
  select: VoiceCommandSelectSchema.optional(),
  include: VoiceCommandIncludeSchema.optional(),
  data: z.union([ VoiceCommandUpdateInputSchema, VoiceCommandUncheckedUpdateInputSchema ]),
  where: VoiceCommandWhereUniqueInputSchema, 
}).strict();

export const VoiceCommandUpdateManyArgsSchema: z.ZodType<Prisma.VoiceCommandUpdateManyArgs> = z.object({
  data: z.union([ VoiceCommandUpdateManyMutationInputSchema, VoiceCommandUncheckedUpdateManyInputSchema ]),
  where: VoiceCommandWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoiceCommandUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.VoiceCommandUpdateManyAndReturnArgs> = z.object({
  data: z.union([ VoiceCommandUpdateManyMutationInputSchema, VoiceCommandUncheckedUpdateManyInputSchema ]),
  where: VoiceCommandWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const VoiceCommandDeleteManyArgsSchema: z.ZodType<Prisma.VoiceCommandDeleteManyArgs> = z.object({
  where: VoiceCommandWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();