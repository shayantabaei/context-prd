# Audit & Compliance Notes: Permission Changes

## Compliance Context
Permission management features that affect billing, payment methods, invoices, subscriptions, or financial reporting must produce audit events suitable for SOC2 evidence collection.

## Required Audit Fields
Each permission change event should include:
- actorId
- actorType
- targetUserId
- organizationId
- partnerOrganizationId if applicable
- previousRole
- newRole
- changeReason if available
- sourceApplication
- timestamp
- correlationId

## Retention
Audit events must be retained according to the existing security event retention policy. The product team does not need to define retention periods in the PRD unless the feature introduces a new event class.

## Governance Expectations
The PRD should define who is allowed to grant billing permissions, whether self-assignment is allowed, and whether internal administrators can override partner admin changes.

## Rollout Governance
For billing-related permission changes, a pilot rollout should include monitoring for unexpected permission expansion, failed audit emissions, and support ticket spikes.

## Missing Decision
There is no current policy stating whether partner administrators can grant billing manager privileges to users outside their own delegated organization.
