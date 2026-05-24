import type {
  ContextDocument,
  CreateInitiativeRequest,
  GeneratedPrd,
  Initiative,
  InitiativeAnalysis,
  PrdSection,
  UpdateInitiativeRequest,
  UploadContextResponse,
  WorkflowStateResponse
} from "@/lib/types/initiative";

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String(body.error)
        : "Request failed";

    throw new Error(message);
  }

  return body as T;
}

export async function createInitiativeRequest(
  payload: CreateInitiativeRequest
): Promise<Initiative> {
  const response = await fetch("/api/initiatives", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<Initiative>(response);
}

export async function updateInitiativeRequest(
  id: string,
  payload: UpdateInitiativeRequest
): Promise<Initiative> {
  const response = await fetch(`/api/initiatives/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<Initiative>(response);
}

export async function getInitiativeRequest(id: string): Promise<Initiative> {
  const response = await fetch(`/api/initiatives/${id}`);

  return parseApiResponse<Initiative>(response);
}

export async function getWorkflowStateRequest(
  initiativeId: string
): Promise<WorkflowStateResponse> {
  const response = await fetch(`/api/initiatives/${initiativeId}/workflow-state`);

  return parseApiResponse<WorkflowStateResponse>(response);
}

export async function uploadContextDocumentsRequest(
  initiativeId: string,
  files: File[]
): Promise<ContextDocument[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`/api/initiatives/${initiativeId}/context`, {
    method: "POST",
    body: formData
  });

  const payload = await parseApiResponse<UploadContextResponse>(response);

  return payload.documents;
}

export async function analyzeInitiativeRequest(
  initiativeId: string
): Promise<InitiativeAnalysis> {
  const response = await fetch(`/api/initiatives/${initiativeId}/analyze`, {
    method: "POST"
  });

  return parseApiResponse<InitiativeAnalysis>(response);
}

export async function generatePrdRequest(
  initiativeId: string,
  clarificationAnswers: { questionId: string; answer: string }[]
): Promise<GeneratedPrd> {
  const response = await fetch(`/api/initiatives/${initiativeId}/generate-prd`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ clarificationAnswers })
  });

  return parseApiResponse<GeneratedPrd>(response);
}

export async function saveClarificationAnswersRequest(
  initiativeId: string,
  clarificationAnswers: { questionId: string; answer: string }[]
): Promise<{ clarificationAnswers: { questionId: string; answer: string }[] }> {
  const response = await fetch(
    `/api/initiatives/${initiativeId}/clarification-answers`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ clarificationAnswers })
    }
  );

  return parseApiResponse<{
    clarificationAnswers: { questionId: string; answer: string }[];
  }>(response);
}

export async function refinePrdSectionRequest({
  initiativeId,
  prd,
  sectionId,
  instruction,
  clarificationAnswers
}: {
  initiativeId: string;
  prd: GeneratedPrd;
  sectionId: string;
  instruction: string;
  clarificationAnswers: { questionId: string; answer: string }[];
}): Promise<PrdSection> {
  const response = await fetch(
    `/api/initiatives/${initiativeId}/refine-prd-section`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        prd,
        sectionId,
        instruction,
        clarificationAnswers
      })
    }
  );

  const payload = await parseApiResponse<{ section: PrdSection }>(response);

  return payload.section;
}
