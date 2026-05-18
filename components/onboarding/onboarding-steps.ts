import { Blocks, CheckCircle2, FileText, Library } from "lucide-react";

export const onboardingSteps = [
  {
    label: "Workspace",
    href: "/onboarding/workspace",
    icon: FileText
  },
  {
    label: "Sources",
    href: "/onboarding/sources",
    icon: Blocks
  },
  {
    label: "Standards",
    href: "/onboarding/templates",
    icon: Library
  },
  {
    label: "Ready",
    href: "/onboarding/complete",
    icon: CheckCircle2
  }
];
