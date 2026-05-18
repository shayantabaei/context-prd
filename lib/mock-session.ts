export type MockAuthState =
  | "unauthenticated"
  | "authenticated_without_workspace"
  | "authenticated_with_workspace";

export type MockSession = {
  state: MockAuthState;
  user: {
    name: string;
    email: string;
  } | null;
};

const SESSION_KEY = "contextprd.mockSession";

const defaultUser = {
  name: "Avery Chen",
  email: "avery@acme.example"
};

export const signedOutSession: MockSession = {
  state: "unauthenticated",
  user: null
};

export function getMockSession(): MockSession {
  if (typeof window === "undefined") {
    return signedOutSession;
  }

  const stored = window.localStorage.getItem(SESSION_KEY);

  if (!stored) {
    return signedOutSession;
  }

  try {
    return JSON.parse(stored) as MockSession;
  } catch {
    return signedOutSession;
  }
}

export function setMockSession(state: MockAuthState) {
  if (typeof window === "undefined") {
    return;
  }

  const session: MockSession = {
    state,
    user: state === "unauthenticated" ? null : defaultUser
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function completeMockWorkspace() {
  setMockSession("authenticated_with_workspace");
}

export function clearMockSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}

export function getPostSignInPath(state: MockAuthState) {
  if (state === "authenticated_with_workspace") {
    return "/app";
  }

  if (state === "authenticated_without_workspace") {
    return "/onboarding/workspace";
  }

  return "/signin";
}
