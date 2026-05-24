export type InitiativeMetadata = {
  team: string;
  workflow: string;
  outputTemplateName: string;
};

export type SuccessMetric = {
  metric: string;
  target: string;
};

export type InitiativeBusinessContext = {
  painPoints: string[];
  outcomes: string;
  successMetrics: SuccessMetric[];
};

export type InitiativeScope = {
  inScope: string[];
  outOfScope: string[];
};

export type InitiativeConstraints = {
  technicalConstraints: string[];
  governanceRequirements: string[];
  rolloutConstraints: string[];
};

export type InitiativeDependency = {
  system: string;
  impact: "low" | "medium" | "high";
  description?: string;
};

export type Initiative = {
  id: number;
  initiativeName: string;
  executiveSummary: string;
  metadata: InitiativeMetadata;
  businessContext: InitiativeBusinessContext;
  scope: InitiativeScope;
  constraints: InitiativeConstraints;
  dependencies: InitiativeDependency[];
};

export type CreateInitiativeRequest = Omit<Initiative, "id">;

export type UpdateInitiativeRequest = Partial<Omit<Initiative, "id">>;

export type ContextDocument = {
  id: number;
  initiativeId: number;
  filename: string;
  mimeType: string;
  uploadedAt: string;
  extractedText?: string;
  processingStatus: "uploaded" | "processing" | "processed" | "failed";
};

export type UploadContextResponse = {
  documents: ContextDocument[];
};

export type InitiativeAnalysis = {
  initiativeId: number;
  documentAnalysis: DocumentAnalysis[];
  irrelevantContext: IrrelevantContext[];
  detectedGaps: AnalysisFinding[];
  detectedRisks: AnalysisFinding[];
  inferredDependencies: AnalysisFinding[];
  clarificationQuestions: ClarificationQuestion[];
  createdAt: string;
};

export type DocumentAnalysis = {
  documentId: number;
  filename: string;
  relevancyScore: number;
  summary: string;
  relevantTopics: string[];
  potentiallyIrrelevantTopics: string[];
  comments: string;
};

export type IrrelevantContext = {
  documentId: number;
  filename: string;
  reason: string;
  irrelevantTopics: string[];
};

export type AnalysisFinding = {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  category: "risk" | "gap" | "dependency" | "governance" | "rollout" | "technical";
  relatedDocuments?: number[];
  relatedSystems?: string[];
  recommendation?: string;
};

export type ClarificationQuestion = {
  id: number;
  documentId?: number;
  question: string;
  rationale: string;
  category: "business" | "technical" | "scope" | "governance" | "dependency" | "rollout";
  severity: "low" | "medium" | "high";
  relatedSystems?: string[];
};

export type ClarificationAnswer = {
  questionId: number;
  answer: string;
};

export type GeneratePrdRequest = {
  clarificationAnswers: ClarificationAnswer[];
};

export type RefinePrdSectionRequest = {
  prd: GeneratedPrd;
  sectionId: string;
  instruction: string;
  clarificationAnswers?: ClarificationAnswer[];
};

export type RefinePrdSectionResponse = {
  section: PrdSection;
};

export type GeneratedPrd = {
  initiativeId: number;
  title: string;
  summary: string;
  sections: PrdSection[];
  openQuestions: string[];
  generatedAt: string;
};

export type PrdSection = {
  id: string;
  title: string;
  content: string;
  sourceReferences: SourceReference[];
};

export type SourceReference = {
  documentId?: number;
  filename?: string;
  clarificationQuestionId?: number;
  label: string;
};
