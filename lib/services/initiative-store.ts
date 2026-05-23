import type {
  ContextDocument,
  CreateInitiativeRequest,
  GeneratedPrd,
  Initiative,
  InitiativeAnalysis,
  UpdateInitiativeRequest
} from "@/lib/types/initiative";

type StoreState = {
  nextInitiativeId: number;
  nextDocumentId: number;
  initiatives: Initiative[];
  documents: ContextDocument[];
  analyses: InitiativeAnalysis[];
  generatedPrds: GeneratedPrd[];
};

const globalStore = globalThis as typeof globalThis & {
  __contextPrdStore?: StoreState;
};

const store: StoreState =
  globalStore.__contextPrdStore ??
  {
    nextInitiativeId: 1,
    nextDocumentId: 1,
    initiatives: [],
    documents: [],
    analyses: [],
    generatedPrds: []
  };

globalStore.__contextPrdStore = store;

export function createInitiative(payload: CreateInitiativeRequest): Initiative {
  const initiative: Initiative = {
    id: store.nextInitiativeId,
    ...payload
  };

  store.nextInitiativeId += 1;
  store.initiatives.push(initiative);

  return initiative;
}

export function updateInitiative(
  id: number,
  payload: UpdateInitiativeRequest
): Initiative {
  const initiative = getInitiative(id);

  if (!initiative) {
    throw new Error("INITIATIVE_NOT_FOUND");
  }

  const updated: Initiative = {
    ...initiative,
    ...payload,
    metadata: payload.metadata ?? initiative.metadata,
    businessContext: payload.businessContext ?? initiative.businessContext,
    scope: payload.scope ?? initiative.scope,
    constraints: payload.constraints ?? initiative.constraints,
    dependencies: payload.dependencies ?? initiative.dependencies
  };

  store.initiatives = store.initiatives.map((item) =>
    item.id === id ? updated : item
  );

  return updated;
}

export function getInitiative(id: number): Initiative | undefined {
  return store.initiatives.find((initiative) => initiative.id === id);
}

export function createDocument(
  document: Omit<ContextDocument, "id" | "uploadedAt">
): ContextDocument {
  const contextDocument: ContextDocument = {
    id: store.nextDocumentId,
    uploadedAt: new Date().toISOString(),
    ...document
  };

  store.nextDocumentId += 1;
  store.documents.push(contextDocument);

  return contextDocument;
}

export function getDocumentsForInitiative(initiativeId: number): ContextDocument[] {
  return store.documents.filter((document) => document.initiativeId === initiativeId);
}

export function saveInitiativeAnalysis(analysis: InitiativeAnalysis): InitiativeAnalysis {
  store.analyses = [
    ...store.analyses.filter((item) => item.initiativeId !== analysis.initiativeId),
    analysis
  ];

  return analysis;
}

export function getLatestInitiativeAnalysis(
  initiativeId: number
): InitiativeAnalysis | undefined {
  return store.analyses
    .filter((analysis) => analysis.initiativeId === initiativeId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

export function saveGeneratedPrd(prd: GeneratedPrd): GeneratedPrd {
  store.generatedPrds = [
    ...store.generatedPrds.filter((item) => item.initiativeId !== prd.initiativeId),
    prd
  ];

  return prd;
}

export function clearStoreForTests() {
  store.nextInitiativeId = 1;
  store.nextDocumentId = 1;
  store.initiatives = [];
  store.documents = [];
  store.analyses = [];
  store.generatedPrds = [];
}
