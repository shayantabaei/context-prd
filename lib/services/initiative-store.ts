import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clarificationAnswers,
  contextDocuments,
  generatedPrds,
  initiativeAnalyses,
  initiatives
} from "@/lib/db/schema";
import type {
  ClarificationAnswer,
  ContextDocument,
  CreateInitiativeRequest,
  GeneratedPrd,
  Initiative,
  InitiativeAnalysis,
  PrdSection,
  UpdateInitiativeRequest
} from "@/lib/types/initiative";
import { replacePrdSection } from "@/lib/prd/refinement";
import { hydrateInitiative } from "@/lib/workflow/initiative-hydration";

function toIsoDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapInitiative(row: typeof initiatives.$inferSelect): Initiative {
  return hydrateInitiative(row);
}

function mapDocument(row: typeof contextDocuments.$inferSelect): ContextDocument {
  return {
    id: row.id,
    initiativeId: row.initiativeId,
    filename: row.filename,
    mimeType: row.mimeType,
    uploadedAt: toIsoDate(row.uploadedAt),
    extractedText: row.extractedText ?? undefined,
    processingStatus: row.processingStatus as ContextDocument["processingStatus"],
    fileSize: row.fileSize ?? undefined,
    extractionError: row.extractionError ?? undefined
  };
}

function mapAnalysis(row: typeof initiativeAnalyses.$inferSelect): InitiativeAnalysis {
  return {
    initiativeId: row.initiativeId,
    documentAnalysis: row.documentAnalysis,
    irrelevantContext: row.irrelevantContext,
    detectedGaps: row.detectedGaps,
    detectedRisks: row.detectedRisks,
    inferredDependencies: row.inferredDependencies,
    clarificationQuestions: row.clarificationQuestions,
    createdAt: toIsoDate(row.createdAt)
  };
}

function mapGeneratedPrd(row: typeof generatedPrds.$inferSelect): GeneratedPrd {
  return {
    initiativeId: row.initiativeId,
    title: row.title,
    summary: row.summary,
    sections: row.sections,
    openQuestions: row.openQuestions,
    generatedAt: toIsoDate(row.generatedAt)
  };
}

export async function createInitiative(
  userId: string,
  payload: CreateInitiativeRequest
): Promise<Initiative> {
  const [initiative] = await db
    .insert(initiatives)
    .values({
      userId,
      initiativeName: payload.initiativeName,
      executiveSummary: payload.executiveSummary,
      metadata: payload.metadata,
      businessContext: payload.businessContext,
      scope: payload.scope,
      constraints: payload.constraints,
      dependencies: payload.dependencies
    })
    .returning();

  return mapInitiative(initiative);
}

export async function updateInitiative(
  userId: string,
  id: string,
  payload: UpdateInitiativeRequest
): Promise<Initiative> {
  const current = await getInitiative(userId, id);

  if (!current) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  const [updated] = await db
    .update(initiatives)
    .set({
      initiativeName: payload.initiativeName ?? current.initiativeName,
      executiveSummary: payload.executiveSummary ?? current.executiveSummary,
      metadata: payload.metadata ?? current.metadata,
      businessContext: payload.businessContext ?? current.businessContext,
      scope: payload.scope ?? current.scope,
      constraints: payload.constraints ?? current.constraints,
      dependencies: payload.dependencies ?? current.dependencies,
      updatedAt: new Date()
    })
    .where(and(eq(initiatives.id, id), eq(initiatives.userId, userId)))
    .returning();

  return mapInitiative(updated);
}

export async function getInitiative(
  userId: string,
  id: string
): Promise<Initiative | undefined> {
  const [initiative] = await db
    .select()
    .from(initiatives)
    .where(and(eq(initiatives.id, id), eq(initiatives.userId, userId)))
    .limit(1);

  return initiative ? mapInitiative(initiative) : undefined;
}

export async function createDocument(
  userId: string,
  document: Omit<ContextDocument, "id" | "uploadedAt">
): Promise<ContextDocument> {
  const [createdDocument] = await db
    .insert(contextDocuments)
    .values({
      initiativeId: document.initiativeId,
      userId,
      filename: document.filename,
      mimeType: document.mimeType,
      extractedText: document.extractedText,
      processingStatus: document.processingStatus,
      fileSize: document.fileSize,
      extractionError: document.extractionError
    })
    .returning();

  return mapDocument(createdDocument);
}

export async function getDocumentsForInitiative(
  userId: string,
  initiativeId: string
): Promise<ContextDocument[]> {
  const documents = await db
    .select()
    .from(contextDocuments)
    .where(
      and(
        eq(contextDocuments.initiativeId, initiativeId),
        eq(contextDocuments.userId, userId)
      )
    );

  return documents.map(mapDocument);
}

export async function saveInitiativeAnalysis(
  userId: string,
  analysis: InitiativeAnalysis
): Promise<InitiativeAnalysis> {
  const [createdAnalysis] = await db
    .insert(initiativeAnalyses)
    .values({
      initiativeId: analysis.initiativeId,
      userId,
      documentAnalysis: analysis.documentAnalysis,
      irrelevantContext: analysis.irrelevantContext,
      detectedGaps: analysis.detectedGaps,
      detectedRisks: analysis.detectedRisks,
      inferredDependencies: analysis.inferredDependencies,
      clarificationQuestions: analysis.clarificationQuestions
    })
    .returning();

  return mapAnalysis(createdAnalysis);
}

export async function getLatestInitiativeAnalysis(
  userId: string,
  initiativeId: string
): Promise<InitiativeAnalysis | undefined> {
  const [analysis] = await db
    .select()
    .from(initiativeAnalyses)
    .where(
      and(
        eq(initiativeAnalyses.initiativeId, initiativeId),
        eq(initiativeAnalyses.userId, userId)
      )
    )
    .orderBy(desc(initiativeAnalyses.createdAt))
    .limit(1);

  return analysis ? mapAnalysis(analysis) : undefined;
}

export async function upsertClarificationAnswers(
  userId: string,
  initiativeId: string,
  answers: ClarificationAnswer[]
): Promise<void> {
  const answered = answers.filter((answer) => answer.answer.trim());
  const clearedQuestionIds = answers
    .filter((answer) => !answer.answer.trim())
    .map((answer) => String(answer.questionId));

  if (clearedQuestionIds.length > 0) {
    await db
      .delete(clarificationAnswers)
      .where(
        and(
          eq(clarificationAnswers.userId, userId),
          eq(clarificationAnswers.initiativeId, initiativeId),
          inArray(clarificationAnswers.questionId, clearedQuestionIds)
        )
      );
  }

  if (answered.length === 0) {
    return;
  }

  await db
    .insert(clarificationAnswers)
    .values(
      answered.map((answer) => ({
        initiativeId,
        userId,
        questionId: String(answer.questionId),
        answer: answer.answer,
        updatedAt: new Date()
      }))
    )
    .onConflictDoUpdate({
      target: [
        clarificationAnswers.userId,
        clarificationAnswers.initiativeId,
        clarificationAnswers.questionId
      ],
      set: {
        answer: sql`excluded.answer`,
        updatedAt: new Date()
      }
    });
}

export async function getClarificationAnswers(
  userId: string,
  initiativeId: string
): Promise<ClarificationAnswer[]> {
  const answers = await db
    .select()
    .from(clarificationAnswers)
    .where(
      and(
        eq(clarificationAnswers.initiativeId, initiativeId),
        eq(clarificationAnswers.userId, userId)
      )
    );

  return answers.map((answer) => ({
    questionId: answer.questionId,
    answer: answer.answer
  }));
}

export async function saveGeneratedPrd(
  userId: string,
  prd: GeneratedPrd
): Promise<GeneratedPrd> {
  const [createdPrd] = await db
    .insert(generatedPrds)
    .values({
      initiativeId: prd.initiativeId,
      userId,
      title: prd.title,
      summary: prd.summary,
      sections: prd.sections,
      openQuestions: prd.openQuestions,
      generatedAt: new Date(prd.generatedAt),
      updatedAt: new Date()
    })
    .returning();

  return mapGeneratedPrd(createdPrd);
}

export async function getLatestGeneratedPrd(
  userId: string,
  initiativeId: string
): Promise<GeneratedPrd | undefined> {
  const [prd] = await db
    .select()
    .from(generatedPrds)
    .where(
      and(
        eq(generatedPrds.initiativeId, initiativeId),
        eq(generatedPrds.userId, userId)
      )
    )
    .orderBy(desc(generatedPrds.generatedAt))
    .limit(1);

  return prd ? mapGeneratedPrd(prd) : undefined;
}

export async function updateLatestGeneratedPrdSection({
  userId,
  initiativeId,
  section
}: {
  userId: string;
  initiativeId: string;
  section: PrdSection;
}): Promise<GeneratedPrd> {
  const [currentPrd] = await db
    .select()
    .from(generatedPrds)
    .where(
      and(
        eq(generatedPrds.initiativeId, initiativeId),
        eq(generatedPrds.userId, userId)
      )
    )
    .orderBy(desc(generatedPrds.generatedAt))
    .limit(1);

  if (!currentPrd) {
    throw new Error("PRD_NOT_FOUND");
  }

  const sections = replacePrdSection(mapGeneratedPrd(currentPrd), section).sections;

  const [updatedPrd] = await db
    .update(generatedPrds)
    .set({
      sections,
      updatedAt: new Date()
    })
    .where(and(eq(generatedPrds.id, currentPrd.id), eq(generatedPrds.userId, userId)))
    .returning();

  return mapGeneratedPrd(updatedPrd);
}
