import { CTASection } from "@/components/landing/CTASection";
import { LandingHero } from "@/components/landing/LandingHero";
import { ProblemValue } from "@/components/landing/ProblemValue";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { TrustSection } from "@/components/landing/TrustSection";
import { WorkflowSteps } from "@/components/landing/WorkflowSteps";

export default function Home() {
  return (
    <main className="overflow-hidden bg-canvas text-zinc-50">
      <LandingHero />
      <ProblemValue />
      <WorkflowSteps />
      <ProductPreview />
      <TrustSection />
      <CTASection />
    </main>
  );
}
