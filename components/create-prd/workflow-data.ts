import {
  AlertTriangle,
  Archive,
  Blocks,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Database,
  FileText,
  FolderOpen,
  GitBranch,
  HelpCircle,
  Library,
  ListChecks,
  MessageSquareText,
  NotebookText,
  ScrollText,
  Shield,
  Sparkles,
  Workflow
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type WorkflowStepId =
  | "setup"
  | "sources"
  | "analysis"
  | "clarify"
  | "generate";

export type WorkflowStep = {
  id: WorkflowStepId;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type ContextSource = {
  id: string;
  name: string;
  status: "Connected" | "Indexed" | "Available";
  description: string;
  icon: LucideIcon;
};

export type SelectedContext = {
  id: string;
  label: string;
  source: string;
};

export type Insight = {
  title: string;
  description: string;
  severity: "warning" | "review" | "ready";
  icon: LucideIcon;
};

export type ClarificationQuestion = {
  id: string;
  question: string;
  answer: string;
  suggestion: string;
  references: string[];
};

export type OutputType = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const workflowSteps: WorkflowStep[] = [
  {
    id: "setup",
    label: "Initiative Definition",
    description: "Requirement framing",
    icon: FileText
  },
  {
    id: "sources",
    label: "Context Sources",
    description: "Governed ingestion",
    icon: Library
  },
  {
    id: "analysis",
    label: "AI Analysis",
    description: "Requirement signals",
    icon: Sparkles
  },
  {
    id: "clarify",
    label: "Clarification",
    description: "Human refinement",
    icon: MessageSquareText
  },
  {
    id: "generate",
    label: "Generate Outputs",
    description: "Engineering readiness",
    icon: ClipboardCheck
  }
];

export const contextSources: ContextSource[] = [
  {
    id: "confluence",
    name: "Confluence",
    status: "Connected",
    description: "Product briefs, team standards, and delivery notes.",
    icon: Blocks
  },
  {
    id: "jira",
    name: "Jira",
    status: "Connected",
    description: "Epics, dependencies, milestones, and issue history.",
    icon: GitBranch
  },
  {
    id: "drive",
    name: "Google Drive",
    status: "Available",
    description: "Docs, spreadsheets, and review artifacts.",
    icon: Cloud
  },
  {
    id: "uploads",
    name: "Uploaded Documents",
    status: "Indexed",
    description: "RFCs, specs, diagrams, and offline reference files.",
    icon: FolderOpen
  },
  {
    id: "meetings",
    name: "Meeting Notes",
    status: "Available",
    description: "Decision logs, stakeholder notes, and launch risks.",
    icon: NotebookText
  },
  {
    id: "architecture",
    name: "Architecture Docs",
    status: "Indexed",
    description: "Service boundaries, data flows, and platform constraints.",
    icon: Database
  }
];

export const initialSelectedContext: SelectedContext[] = [
  { id: "payments-architecture", label: "Payments Architecture v2", source: "Architecture Docs" },
  { id: "partner-billing-rfc", label: "Partner Billing RFC", source: "Uploaded Documents" },
  { id: "rbac-migration", label: "RBAC Migration Notes", source: "Confluence" },
  { id: "security-review", label: "Security Compliance Review", source: "Google Drive" },
  { id: "billing-api", label: "Billing API Spec", source: "Architecture Docs" }
];

export const insights: Insight[] = [
  {
    title: "Missing rollback requirements detected",
    description: "The selected context describes migration steps but not rollback ownership or decision thresholds.",
    severity: "warning",
    icon: AlertTriangle
  },
  {
    title: "Security review likely required",
    description: "Role and permission changes touch partner access paths and audit surfaces.",
    severity: "review",
    icon: Shield
  },
  {
    title: "Dependency on billing gateway migration",
    description: "Delivery sequencing depends on gateway compatibility work tracked by Platform Billing.",
    severity: "review",
    icon: Workflow
  },
  {
    title: "Acceptance criteria incomplete",
    description: "QA coverage is strong for happy paths, but edge-case permission inheritance is underspecified.",
    severity: "warning",
    icon: ListChecks
  },
  {
    title: "Legacy API compatibility unclear",
    description: "Existing partner integrations may require a transition policy before launch.",
    severity: "warning",
    icon: HelpCircle
  }
];

export const clarificationQuestions: ClarificationQuestion[] = [
  {
    id: "audit-logging",
    question: "Should admin permission changes require audit logging?",
    answer: "Yes. Permission changes should emit audit events with actor, timestamp, role delta, and affected partner account.",
    suggestion: "Add explicit audit event requirements and QA validation criteria.",
    references: ["Security Compliance Review", "RBAC Migration Notes"]
  },
  {
    id: "compatibility",
    question: "Is backward compatibility required for existing partner integrations?",
    answer: "Existing API clients should remain compatible for one release cycle, with deprecation notices in partner admin surfaces.",
    suggestion: "Include compatibility constraints and rollout communication tasks.",
    references: ["Billing API Spec", "Partner Billing RFC"]
  },
  {
    id: "inheritance",
    question: "Should external partners inherit organization-level roles?",
    answer: "",
    suggestion: "Clarify inheritance behavior before generation to avoid ambiguous authorization requirements.",
    references: ["Payments Architecture v2", "RBAC Migration Notes"]
  }
];

export const outputTypes: OutputType[] = [
  {
    id: "enterprise-prd",
    name: "Enterprise PRD",
    description: "Full product requirements document with goals, scope, requirements, and open questions.",
    icon: FileText
  },
  {
    id: "engineering-tasks",
    name: "Engineering Tasks",
    description: "Implementation-ready task breakdown with dependencies and owners.",
    icon: ListChecks
  },
  {
    id: "rollout-checklist",
    name: "Rollout Checklist",
    description: "Launch, monitoring, rollback, and stakeholder readiness steps.",
    icon: CheckCircle2
  },
  {
    id: "architecture-summary",
    name: "Architecture Summary",
    description: "System impacts, data flows, service boundaries, and technical constraints.",
    icon: Archive
  },
  {
    id: "jira-epics",
    name: "Jira Epic Drafts",
    description: "Epic and story draft structure for downstream delivery planning.",
    icon: ScrollText
  }
];
