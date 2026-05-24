import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";
import type {
  AnalysisFinding,
  ClarificationQuestion,
  DocumentAnalysis,
  InitiativeBusinessContext,
  InitiativeConstraints,
  InitiativeDependency,
  InitiativeMetadata,
  InitiativeScope,
  IrrelevantContext,
  PrdSection
} from "@/lib/types/initiative";

export const initiatives = pgTable("initiatives", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  initiativeName: text("initiative_name").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  metadata: jsonb("metadata").$type<InitiativeMetadata>().notNull(),
  businessContext: jsonb("business_context")
    .$type<InitiativeBusinessContext>()
    .notNull(),
  scope: jsonb("scope").$type<InitiativeScope>().notNull(),
  constraints: jsonb("constraints").$type<InitiativeConstraints>().notNull(),
  dependencies: jsonb("dependencies").$type<InitiativeDependency[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
});

export const contextDocuments = pgTable("context_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  initiativeId: uuid("initiative_id")
    .notNull()
    .references(() => initiatives.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  extractedText: text("extracted_text"),
  processingStatus: text("processing_status").notNull(),
  fileSize: integer("file_size"),
  extractionError: text("extraction_error")
});

export const initiativeAnalyses = pgTable("initiative_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  initiativeId: uuid("initiative_id")
    .notNull()
    .references(() => initiatives.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  documentAnalysis: jsonb("document_analysis")
    .$type<DocumentAnalysis[]>()
    .notNull(),
  irrelevantContext: jsonb("irrelevant_context")
    .$type<IrrelevantContext[]>()
    .notNull(),
  detectedGaps: jsonb("detected_gaps").$type<AnalysisFinding[]>().notNull(),
  detectedRisks: jsonb("detected_risks").$type<AnalysisFinding[]>().notNull(),
  inferredDependencies: jsonb("inferred_dependencies")
    .$type<AnalysisFinding[]>()
    .notNull(),
  clarificationQuestions: jsonb("clarification_questions")
    .$type<ClarificationQuestion[]>()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull()
});

export const clarificationAnswers = pgTable(
  "clarification_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    initiativeId: uuid("initiative_id")
      .notNull()
      .references(() => initiatives.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    questionId: text("question_id").notNull(),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("clarification_answers_user_initiative_question_idx").on(
      table.userId,
      table.initiativeId,
      table.questionId
    )
  ]
);

export const generatedPrds = pgTable("generated_prds", {
  id: uuid("id").defaultRandom().primaryKey(),
  initiativeId: uuid("initiative_id")
    .notNull()
    .references(() => initiatives.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sections: jsonb("sections").$type<PrdSection[]>().notNull(),
  openQuestions: jsonb("open_questions").$type<string[]>().notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
});
