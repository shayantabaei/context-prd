import type { Initiative } from "@/lib/types/initiative";

type InitiativeRowLike = {
  id: string;
  initiativeName: string;
  executiveSummary: string;
  metadata: unknown;
  businessContext: unknown;
  scope: unknown;
  constraints: unknown;
  dependencies: unknown;
};

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function mapInitiativeMetadata(value: unknown): Initiative["metadata"] {
  const metadata = objectValue(value);

  return {
    team: stringValue(metadata.team),
    workflow: stringValue(metadata.workflow),
    outputTemplateName: stringValue(metadata.outputTemplateName)
  };
}

function mapBusinessContext(value: unknown): Initiative["businessContext"] {
  const context = objectValue(value);
  const rawMetrics = Array.isArray(context.successMetrics)
    ? context.successMetrics
    : [];

  return {
    painPoints: stringArray(context.painPoints),
    outcomes: stringValue(context.outcomes),
    successMetrics: rawMetrics
      .filter((metric) => metric && typeof metric === "object")
      .map((metric) => {
        const record = metric as Record<string, unknown>;

        return {
          metric: stringValue(record.metric),
          target: stringValue(record.target)
        };
      })
      .filter((metric) => metric.metric || metric.target)
  };
}

function mapScope(value: unknown): Initiative["scope"] {
  const scope = objectValue(value);

  return {
    inScope: stringArray(scope.inScope),
    outOfScope: stringArray(scope.outOfScope)
  };
}

function mapConstraints(value: unknown): Initiative["constraints"] {
  const constraints = objectValue(value);

  return {
    technicalConstraints: stringArray(constraints.technicalConstraints),
    governanceRequirements: stringArray(constraints.governanceRequirements),
    rolloutConstraints: stringArray(constraints.rolloutConstraints)
  };
}

function mapDependencies(value: unknown): Initiative["dependencies"] {
  return Array.isArray(value)
    ? value
        .filter((dependency) => dependency && typeof dependency === "object")
        .map((dependency) => {
          const record = dependency as Record<string, unknown>;
          const impact = String(record.impact);

          return {
            system: stringValue(record.system),
            impact: ["low", "medium", "high"].includes(impact)
              ? (impact as "low" | "medium" | "high")
              : "medium",
            description: stringValue(record.description)
          };
        })
        .filter((dependency) => dependency.system)
    : [];
}

export function hydrateInitiative(row: InitiativeRowLike): Initiative {
  return {
    id: row.id,
    initiativeName: row.initiativeName,
    executiveSummary: row.executiveSummary,
    metadata: mapInitiativeMetadata(row.metadata),
    businessContext: mapBusinessContext(row.businessContext),
    scope: mapScope(row.scope),
    constraints: mapConstraints(row.constraints),
    dependencies: mapDependencies(row.dependencies)
  };
}
