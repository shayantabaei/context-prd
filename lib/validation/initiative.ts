import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const successMetricSchema = z.object({
  metric: nonEmptyString,
  target: nonEmptyString
});

export const initiativeDependencySchema = z.object({
  system: nonEmptyString,
  impact: z.enum(["low", "medium", "high"]),
  description: z.string().trim().optional()
});

export const initiativeSchema = z.object({
  initiativeName: nonEmptyString,
  executiveSummary: nonEmptyString,
  metadata: z.object({
    team: nonEmptyString,
    workflow: nonEmptyString,
    outputTemplateName: nonEmptyString
  }),
  businessContext: z.object({
    painPoints: z.array(nonEmptyString),
    outcomes: nonEmptyString,
    successMetrics: z.array(successMetricSchema)
  }),
  scope: z.object({
    inScope: z.array(nonEmptyString),
    outOfScope: z.array(nonEmptyString)
  }),
  constraints: z.object({
    technicalConstraints: z.array(nonEmptyString),
    governanceRequirements: z.array(nonEmptyString),
    rolloutConstraints: z.array(nonEmptyString)
  }),
  dependencies: z.array(initiativeDependencySchema)
});

export const createInitiativeRequestSchema = initiativeSchema;

export const updateInitiativeRequestSchema = initiativeSchema.partial();

export const documentAnalysisSchema = z.object({
  documentId: z.number().int().positive(),
  filename: nonEmptyString,
  relevancyScore: z.number().min(0).max(1),
  summary: nonEmptyString,
  relevantTopics: z.array(nonEmptyString),
  potentiallyIrrelevantTopics: z.array(nonEmptyString),
  comments: nonEmptyString
});

export const irrelevantContextSchema = z.object({
  documentId: z.number().int().positive(),
  filename: nonEmptyString,
  reason: nonEmptyString,
  irrelevantTopics: z.array(nonEmptyString)
});

export const analysisFindingSchema = z.object({
  title: nonEmptyString,
  description: nonEmptyString,
  severity: z.enum(["low", "medium", "high"]),
  category: z.enum([
    "risk",
    "gap",
    "dependency",
    "governance",
    "rollout",
    "technical"
  ]),
  relatedDocuments: z.array(z.number().int().positive()).optional(),
  relatedSystems: z.array(nonEmptyString).optional(),
  recommendation: z.string().trim().optional()
});

export const clarificationQuestionSchema = z.object({
  id: z.number().int().positive(),
  documentId: z.number().int().positive().optional(),
  question: nonEmptyString,
  rationale: nonEmptyString,
  category: z.enum([
    "business",
    "technical",
    "scope",
    "governance",
    "dependency",
    "rollout"
  ]),
  severity: z.enum(["low", "medium", "high"]),
  relatedSystems: z.array(nonEmptyString).optional()
});

export const initiativeAnalysisSchema = z.object({
  initiativeId: z.number().int().positive(),
  documentAnalysis: z.array(documentAnalysisSchema),
  irrelevantContext: z.array(irrelevantContextSchema),
  detectedGaps: z.array(analysisFindingSchema),
  detectedRisks: z.array(analysisFindingSchema),
  inferredDependencies: z.array(analysisFindingSchema),
  clarificationQuestions: z.array(clarificationQuestionSchema),
  createdAt: z.string().datetime()
});

export const clarificationAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  answer: z.string().trim()
});

export const generatePrdRequestSchema = z.object({
  clarificationAnswers: z.array(clarificationAnswerSchema)
});

export const sourceReferenceSchema = z.object({
  documentId: z.number().int().positive().optional(),
  filename: z.string().trim().optional(),
  clarificationQuestionId: z.number().int().positive().optional(),
  label: nonEmptyString
});

export const prdSectionSchema = z.object({
  id: nonEmptyString,
  title: nonEmptyString,
  content: nonEmptyString,
  sourceReferences: z.array(sourceReferenceSchema)
});

export const generatedPrdSchema = z.object({
  initiativeId: z.number().int().positive(),
  title: nonEmptyString,
  summary: nonEmptyString,
  sections: z.array(prdSectionSchema),
  openQuestions: z.array(nonEmptyString),
  generatedAt: z.string().datetime()
});

export const refinePrdSectionRequestSchema = z.object({
  prd: generatedPrdSchema,
  sectionId: nonEmptyString,
  instruction: nonEmptyString,
  clarificationAnswers: z.array(clarificationAnswerSchema).optional()
});

export const refinePrdSectionResponseSchema = z.object({
  section: prdSectionSchema
});
