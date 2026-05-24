# Billing API Permission Spec

## Purpose
The Billing Service evaluates billing capabilities at request time. It currently supports internal administrator access, customer billing administrator access, and read-only billing viewer access.

## Current Capabilities
- billing.invoice.view
- billing.invoice.download
- billing.payment_method.view
- billing.payment_method.manage
- billing.subscription.manage

## Current Enforcement
The Billing Service calls the RBAC Engine using userId, organizationId, and requestedCapability. Capability checks are synchronous and cached for 60 seconds. Permission changes may take up to 60 seconds to fully propagate across billing APIs.

## Partner Access
Partner access is currently handled through internal support override flows. There is no first-class partner billing role in the Billing Service capability map.

## Required Capability Mapping for Proposed Feature
Potential new mappings:
- partner.billing.viewer → billing.invoice.view, billing.invoice.download
- partner.billing.manager → billing.invoice.view, billing.invoice.download, billing.payment_method.view

The partner.billing.manager role should not include billing.payment_method.manage or billing.subscription.manage in v1 unless explicitly approved by Billing Operations.

## Operational Constraint
Billing Service schema changes are not planned for the next quarter. Any v1 implementation should rely on existing capability evaluation and RBAC role mapping.

## Risks
Adding partner roles without clear capability boundaries could expose payment method details to unauthorized partner users.
