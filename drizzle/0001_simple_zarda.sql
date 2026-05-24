CREATE TABLE "clarification_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initiative_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "context_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initiative_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"extracted_text" text,
	"processing_status" text NOT NULL,
	"file_size" integer,
	"extraction_error" text
);
--> statement-breakpoint
CREATE TABLE "generated_prds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initiative_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"sections" jsonb NOT NULL,
	"open_questions" jsonb NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initiative_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"document_analysis" jsonb NOT NULL,
	"irrelevant_context" jsonb NOT NULL,
	"detected_gaps" jsonb NOT NULL,
	"detected_risks" jsonb NOT NULL,
	"inferred_dependencies" jsonb NOT NULL,
	"clarification_questions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"initiative_name" text NOT NULL,
	"executive_summary" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"business_context" jsonb NOT NULL,
	"scope" jsonb NOT NULL,
	"constraints" jsonb NOT NULL,
	"dependencies" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clarification_answers" ADD CONSTRAINT "clarification_answers_initiative_id_initiatives_id_fk" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "context_documents" ADD CONSTRAINT "context_documents_initiative_id_initiatives_id_fk" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_prds" ADD CONSTRAINT "generated_prds_initiative_id_initiatives_id_fk" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initiative_analyses" ADD CONSTRAINT "initiative_analyses_initiative_id_initiatives_id_fk" FOREIGN KEY ("initiative_id") REFERENCES "public"."initiatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clarification_answers_user_initiative_question_idx" ON "clarification_answers" USING btree ("user_id","initiative_id","question_id");