import type {
  ContextDocument,
  CreateInitiativeRequest,
  Initiative,
  InitiativeAnalysis,
  UpdateInitiativeRequest,
  UploadContextResponse
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
  id: number,
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

export async function uploadContextDocumentsRequest(
  initiativeId: number,
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
  initiativeId: number
): Promise<InitiativeAnalysis> {
  const response = await fetch(`/api/initiatives/${initiativeId}/analyze`, {
    method: "POST"
  });

  return parseApiResponse<InitiativeAnalysis>(response);
}
