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
  id: string;
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
  id: string;
  initiativeId: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;
  extractedText?: string;
  processingStatus: "uploaded" | "processing" | "processed" | "failed";
  fileSize?: number;
  extractionError?: string;
};

export type UploadContextResponse = {
  documents: ContextDocument[];
};

export type InitiativeAnalysis = {
  initiativeId: string;
  documentAnalysis: DocumentAnalysis[];
  irrelevantContext: IrrelevantContext[];
  detectedGaps: AnalysisFinding[];
  detectedRisks: AnalysisFinding[];
  inferredDependencies: AnalysisFinding[];
  clarificationQuestions: ClarificationQuestion[];
  createdAt: string;
};

export type DocumentAnalysis = {
  documentId: string;
  filename: string;
  relevancyScore: number;
  summary: string;
  relevantTopics: string[];
  potentiallyIrrelevantTopics: string[];
  comments: string;
};

export type IrrelevantContext = {
  documentId: string;
  filename: string;
  reason: string;
  irrelevantTopics: string[];
};

export type AnalysisFinding = {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  category: "risk" | "gap" | "dependency" | "governance" | "rollout" | "technical";
  relatedDocuments?: string[];
  relatedSystems?: string[];
  recommendation?: string;
};

export type ClarificationQuestion = {
  id: string;
  documentId?: string;
  question: string;
  rationale: string;
  category: "business" | "technical" | "scope" | "governance" | "dependency" | "rollout";
  severity: "low" | "medium" | "high";
  relatedSystems?: string[];
};

export type ClarificationAnswer = {
  questionId: string;
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
  initiativeId: string;
  title: string;
  summary: string;
  sections: PrdSection[];
  openQuestions: string[];
  generatedAt: string;
};

export type WorkflowStateResponse = {
  initiative: Initiative;
  documents: ContextDocument[];
  analysis?: InitiativeAnalysis;
  clarificationAnswers: ClarificationAnswer[];
  generatedPrd?: GeneratedPrd;
};

export type PrdSection = {
  id: string;
  title: string;
  content: string;
  sourceReferences: SourceReference[];
};

export type SourceReference = {
  documentId?: string;
  filename?: string;
  clarificationQuestionId?: string;
  label: string;
};
