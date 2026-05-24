# ContextPRD Test Pack

Use `test_scenario_initiative.md` to fill the initiative form.

Upload these as context documents:
1. `rbac_architecture_v2.md` - highly relevant
2. `billing_api_permissions_spec.md` - highly relevant
3. `audit_compliance_notes.md` - highly relevant
4. `partner_portal_frontend_notes.md` - relevant frontend/rollout context
5. `irrelevant_mobile_release_notes.txt` - mostly irrelevant/noisy context

Expected analyzer behavior:
- Identify RBAC, Billing Service, Partner Portal, and Audit Pipeline as key dependencies.
- Flag missing decisions around role inheritance, self-assignment, deny overrides, and capability boundaries.
- Flag governance risks around SOC2 auditability and payment method exposure.
- Mark mobile release notes as mostly irrelevant/superfluous.
- Ask clarification questions about partner billing role boundaries, rollout, audit events, and UI placement.
