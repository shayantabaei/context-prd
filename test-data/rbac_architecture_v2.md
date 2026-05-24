# RBAC Architecture v2

## Overview
The RBAC Engine manages role assignments for internal users, customer administrators, and partner administrators. Role membership is evaluated using organization hierarchy, explicit grants, inherited grants, and deny overrides.

## Role Assignment Model
Roles can be assigned at the organization level or workspace level. Organization-level grants may be inherited by child workspaces unless a deny override exists. Partner organizations are represented as delegated organizations linked to a primary customer account.

## Partner Role Behavior
Partner administrators currently support two partner-scoped roles:
- Partner Admin: manages partner users and basic account settings.
- Partner Support: views limited customer support metadata.

Billing-specific partner roles do not currently exist. Any new billing permissions must either extend the existing Partner Admin role or introduce new explicit roles.

## Inheritance Considerations
Inherited grants are currently supported for customer organizations but only partially supported for partner organizations. The RBAC Engine can evaluate partner inheritance, but the Partner Portal does not expose controls for configuring inherited partner permissions.

## Deny Overrides
Deny overrides are supported for sensitive permissions. The engine currently uses deny overrides for security administration and payment method changes.

## Audit Events
The RBAC Engine emits role_assignment_created and role_assignment_revoked events. Existing payload fields include actorId, targetUserId, organizationId, roleId, timestamp, and sourceApplication.

## Open Questions
- Should billing-related partner permissions inherit from organization-level Partner Admin role assignment?
- Should billing role assignment require deny override support?
- Should partner administrators be able to assign billing manager permissions to themselves?

## Non-Relevant Legacy Notes
The legacy mobile admin application used a separate role table before 2021. That application is deprecated and no longer receives new access control features.
