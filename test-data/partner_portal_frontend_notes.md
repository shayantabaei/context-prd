# Partner Portal Frontend Notes

## Current User Management Page
The Partner Portal currently has a User Management page used by Partner Admins. It supports inviting partner users, deactivating users, and assigning Partner Admin or Partner Support roles.

## UI Constraints
The current page uses a server-rendered table with client-side role assignment controls. Adding additional role types is feasible, but the current dropdown does not support grouped permissions or explanatory role descriptions.

## Feature Flag Support
The Partner Portal supports feature flags using the `partnerPortalFeatures` configuration object. Feature flags are evaluated at session creation time. Mid-session flag changes are not guaranteed to appear until the next login.

## Empty States
The portal does not currently have a dedicated audit trail view for partner administrators. If audit visibility is required, a separate page or modal will need to be designed.

## Accessibility
Role assignment controls must remain keyboard accessible and screen-reader friendly.

## UX Open Questions
- Should billing roles appear in the existing role dropdown or in a separate billing permissions panel?
- Should users see explanatory text for each billing role?
- Should partner admins receive a confirmation modal before granting billing manager access?
