# TIAL customer account experience

Prepared source for two separate Customer Account UI extensions for the existing **Tial Admin Connector** Shopify app.

## Extensions

### TIAL Account page
- Full-page customer account dashboard.
- Shows the authenticated customer's name, email, optional phone number, and latest five orders.
- Links to Shopify's native profile and order-history pages.

### TIAL Profile block
- Adds a TIAL-branded block to the native customer profile page.
- Shows the authenticated customer's name and email.
- Links to the TIAL Account page.

Shopify requires full-page targets to be separate from other extension targets, so these are maintained as two distinct extension folders.

## Required scopes

- `customer_read_customers` — customer profile data.
- `customer_read_orders` — order history and order status data.

These are Customer Account API scopes, not the Admin API scopes with similar names.

## Source folders

- `shopify/customer-account-extension/` — full-page TIAL Account extension.
- `shopify/customer-account-profile-block/` — native profile-page block.
- `shopify/customer-account-extension/APP-CONFIG.md` — app integration and deployment checklist.

## Not deployed

This repository is the TIAL Admin Studio repository, not the source project for the installed Shopify app. The extension folders must be transferred into the existing Tial Admin Connector app project. Shopify CLI must generate each extension UID, compile and preview both extensions, and deploy the resulting app version before either appears in customer accounts.
