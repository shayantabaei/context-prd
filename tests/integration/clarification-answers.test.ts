import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => {
  const insertValues = vi.fn(() => ({
    onConflictDoUpdate: vi.fn(async () => undefined)
  }));
  const deleteWhere = vi.fn(async () => undefined);
  const selectWhere = vi.fn(async () => [
    { questionId: "1", answer: "Use feature flags." },
    { questionId: "2", answer: "Emit actor, timestamp, and role delta." }
  ]);

  return {
    insertValues,
    deleteWhere,
    selectWhere,
    db: {
      insert: vi.fn(() => ({ values: insertValues })),
      delete: vi.fn(() => ({ where: deleteWhere })),
      select: vi.fn(() => ({
        from: vi.fn(() => ({ where: selectWhere }))
      }))
    }
  };
});

vi.mock("@/lib/db", () => ({
  db: dbMock.db
}));

import {
  getClarificationAnswers,
  upsertClarificationAnswers
} from "@/lib/services/initiative-store";

describe("clarification answer persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts answered clarifications and ignores blank answers for insert", async () => {
    await upsertClarificationAnswers("user-1", "initiative-1", [
      { questionId: "1", answer: "Use feature flags." },
      { questionId: "2", answer: "" }
    ]);

    expect(dbMock.db.delete).toHaveBeenCalledTimes(1);
    expect(dbMock.deleteWhere).toHaveBeenCalledTimes(1);
    expect(dbMock.db.insert).toHaveBeenCalledTimes(1);
    expect(dbMock.insertValues).toHaveBeenCalledWith([
      {
        initiativeId: "initiative-1",
        userId: "user-1",
        questionId: "1",
        answer: "Use feature flags.",
        updatedAt: expect.any(Date)
      }
    ]);
  });

  it("deletes cleared answers without inserting empty rows", async () => {
    await upsertClarificationAnswers("user-1", "initiative-1", [
      { questionId: "1", answer: "" }
    ]);

    expect(dbMock.db.delete).toHaveBeenCalledTimes(1);
    expect(dbMock.db.insert).not.toHaveBeenCalled();
  });

  it("retrieves answers in the API-facing shape", async () => {
    const answers = await getClarificationAnswers("user-1", "initiative-1");

    expect(dbMock.db.select).toHaveBeenCalledTimes(1);
    expect(answers).toEqual([
      { questionId: "1", answer: "Use feature flags." },
      { questionId: "2", answer: "Emit actor, timestamp, and role delta." }
    ]);
  });
});
