# TIAL customer account extensions — app configuration patch

Apply these changes to the existing **Tial Admin Connector** Shopify app. Do not create a second Shopify app and do not rotate or expose credentials.

## Required Customer Account API scopes

The existing `shopify.app.tial-accounts.toml` in this repository already lists:
- `customer_read_customers`
- `customer_read_orders`
- `customer_write_customers`

Preserve all current Admin API scopes and app settings. These Customer Account API scopes are separate from Admin API `read_customers` and `read_orders`. The full-page extension reads customer details and orders and saves first/last-name edits, so all three scopes are required for the prepared feature set.

## Two separate extensions — required by Shopify

Shopify does not allow a full-page target and a profile-block target in the same extension. Keep these as two separate extension folders:

1. `shopify/customer-account-extension/`
   - Full-page target: `customer-account.page.render`
   - Handle: `tial-account`
2. `shopify/customer-account-profile-block/`
   - Profile block target: `customer-account.profile.block.render`
   - Handle: `tial-profile-block`

Each folder contains its own `shopify.extension.toml`, `package.json`, and source module. Shopify CLI must generate and manage a unique UID for each extension. Do not invent a UID manually.

## Deployment and verification checklist

1. Open the source project connected to the already-installed **Tial Admin Connector** app.
2. Confirm its app configuration uses the existing app client ID and preserves all existing scopes and settings. The reference configuration in this repository is `shopify.app.tial-accounts.toml`; do not create a duplicate app.
3. Register both extension folders in that app project, preserving their separate targets and handles.
4. Run `shopify app dev`; let Shopify CLI register/generate each extension UID and resolve dependencies.
5. Preview both extensions in the Shopify Dev Console. Confirm the full-page extension and profile block are listed separately.
6. Test with a signed-in customer who has orders and another who has none. Verify customer name/email, order date, total, payment and fulfilment status, and first/last-name save behavior.
7. Run `shopify app deploy` only after previews pass. Review the generated app version and scopes before releasing it.
8. In Shopify Admin, open **Settings → Customer accounts → Customize**. Add the TIAL full-page app page to customer-account navigation and place the profile block on the profile page.
9. Verify both extensions from a signed-in customer account. Do not publish or modify the storefront theme as part of this process.

## Security and scope boundaries

- No app client secret, Admin API token, or customer records are included in these source files.
- Customer profile and order data are queried from the authenticated customer's Customer Account API context.
- The extension does not call Admin Studio or expose Admin API credentials in the browser.
- Wishlist is a link to the store's existing published Wishlist page. Cross-device wishlist synchronization is not implemented here.
- Customer data access remains subject to Shopify protected customer data requirements and any applicable app review/approval.
- Shopify's native account menu remains responsible for sign-out; this extension does not pretend to provide a separate logout action.

## Deployment status

Source refinement only. The extension source has not been compiled with Shopify CLI, deployed, or enabled in customer-account navigation. The repository connection does not expose the full installed app source or a Shopify CLI deployment session, so do not claim the custom account page is live until the existing app project has been used to deploy and activate both extensions.
