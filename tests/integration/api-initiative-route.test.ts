import { beforeEach, describe, expect, it, vi } from "vitest";
import { initiativeFixture } from "../utils/fixtures";

const routeMocks = vi.hoisted(() => ({
  requireUserId: vi.fn(),
  getInitiative: vi.fn(),
  updateInitiative: vi.fn()
}));

vi.mock("@/lib/auth/server-user", () => ({
  requireUserId: routeMocks.requireUserId
}));

vi.mock("@/lib/services/initiative-store", () => ({
  getInitiative: routeMocks.getInitiative,
  updateInitiative: routeMocks.updateInitiative
}));

import { GET, PUT } from "@/app/api/initiatives/[id]/route";

const routeContext = (id: string) => ({
  params: Promise.resolve({ id })
});

describe("/api/initiatives/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated initiative retrieval", async () => {
    routeMocks.requireUserId.mockRejectedValue(new Error("UNAUTHORIZED"));

    const response = await GET(
      new Request("http://localhost/api/initiatives/11111111-1111-4111-8111-111111111111"),
      routeContext("11111111-1111-4111-8111-111111111111")
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "Authentication required"
    });
  });

  it("returns a user-scoped initiative for authenticated requests", async () => {
    routeMocks.requireUserId.mockResolvedValue("user-1");
    routeMocks.getInitiative.mockResolvedValue(initiativeFixture);

    const response = await GET(
      new Request("http://localhost/api/initiatives/11111111-1111-4111-8111-111111111111"),
      routeContext("11111111-1111-4111-8111-111111111111")
    );

    expect(response.status).toBe(200);
    expect(routeMocks.getInitiative).toHaveBeenCalledWith(
      "user-1",
      "11111111-1111-4111-8111-111111111111"
    );
    expect(await response.json()).toMatchObject({
      id: initiativeFixture.id,
      scope: initiativeFixture.scope
    });
  });

  it("handles invalid ids before calling auth or persistence", async () => {
    const response = await GET(
      new Request("http://localhost/api/initiatives/not-a-uuid"),
      routeContext("not-a-uuid")
    );

    expect(response.status).toBe(400);
    expect(routeMocks.requireUserId).not.toHaveBeenCalled();
    expect(routeMocks.getInitiative).not.toHaveBeenCalled();
  });

  it("rejects invalid update payloads", async () => {
    routeMocks.requireUserId.mockResolvedValue("user-1");

    const response = await PUT(
      new Request("http://localhost/api/initiatives/11111111-1111-4111-8111-111111111111", {
        method: "PUT",
        body: JSON.stringify({ initiativeName: "" })
      }),
      routeContext("11111111-1111-4111-8111-111111111111")
    );

    expect(response.status).toBe(400);
    expect(routeMocks.updateInitiative).not.toHaveBeenCalled();
  });
});
