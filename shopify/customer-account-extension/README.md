# TIAL customer account experience

Prepared source for two separate Customer Account UI extensions for the existing **Tial Admin Connector** Shopify app. The design follows the FUBS account pattern: order history first, then account details and saved addresses, with concise links to customer support and the wishlist.

## Extensions

### TIAL Account page
- Full-page customer account dashboard headed **My Account**.
- Greets the authenticated customer and shows their name and email.
- Puts the latest three orders directly below the greeting.
- Shows order date, total, payment status, and fulfilment status.
- Provides secure links to Shopify's native order history, profile verification, and address-management pages.
- Supports editing the customer's first and last name through the authenticated Customer Account API.
- Links to TIAL's published Wishlist and Contact pages on the current Shopify storefront domain. Replace these temporary myshopify.com URLs only during the separately planned domain-integration phase.

### TIAL Profile block
- Adds a TIAL-branded block to the native customer profile page.
- Shows the authenticated customer's name and email.
- Links to the TIAL Account page using Shopify's extension navigation protocol.

Shopify requires full-page targets to be separate from other extension targets, so these are maintained as two distinct extension folders.

## Required Customer Account API scopes

- `customer_read_customers` — customer profile data.
- `customer_read_orders` — order history and order status data.
- `customer_write_customers` — save first-name and last-name edits.

These are Customer Account API scopes, not the Admin API scopes with similar names. The existing `shopify.app.tial-accounts.toml` configuration already lists these Customer Account API scopes; preserve the existing Admin API scopes as well.

## Source folders

- `shopify/customer-account-extension/` — full-page TIAL Account extension.
- `shopify/customer-account-profile-block/` — native profile-page block.
- `shopify/customer-account-extension/APP-CONFIG.md` — app integration and deployment checklist.

## Deployment status

The extension source is maintained in this TIAL Admin Studio repository, but this repository is not confirmed to be the full Shopify CLI source project for the installed app. The existing **Tial Admin Connector** app must be used; do not create a duplicate app. Shopify CLI must register each extension, resolve dependencies, compile, preview, and deploy the app version before either extension appears in customer accounts. See `APP-CONFIG.md`.
