# TIAL customer account extensions — app configuration patch

Apply these to the existing **Tial Admin Connector** app project. Do not create a second Shopify app and do not rotate or expose credentials.

## Required Customer Account API scopes

Merge both scopes into the existing `shopify.app.toml` `[access_scopes]` list. Preserve every existing Admin API scope:

```toml
[access_scopes]
scopes = "..., customer_read_customers, customer_read_orders"
```

These are Customer Account API scopes, separate from Admin API `read_customers` and `read_orders`. The profile query requires `customer_read_customers`; the recent-order query requires `customer_read_orders`.

## Two separate extensions — required by Shopify

Shopify does not allow a full-page target and another target in the same extension. The two prepared extensions are deliberately separate:

1. Copy `shopify/customer-account-extension/` into the app project as `extensions/tial-account/`.
   - Full-page target: `customer-account.page.render`
   - Handle: `tial-account`
2. Copy `shopify/customer-account-profile-block/` into the app project as `extensions/tial-profile-block/`.
   - Profile block target: `customer-account.profile.block.render`
   - Handle: `tial-profile-block`

Each folder contains its own `shopify.extension.toml`, `package.json`, and source module. Shopify CLI must generate and manage a unique `uid` for each extension. Do not invent a UID manually.

## Deployment and verification checklist

1. Open the existing Tial Admin Connector Shopify CLI project.
2. Merge both Customer Account API scopes above into its existing `shopify.app.toml`, preserving all current scopes and app settings.
3. Copy the two extension folders into the existing app's `extensions/` directory using the names above.
4. Run `shopify app dev`; let Shopify CLI register/generate each extension UID and resolve dependencies.
5. Preview both extensions in the Shopify Dev Console. Confirm the full-page extension and profile block are listed separately.
6. Test with a signed-in customer who has orders and another who has none. Verify profile data, email, order dates, amounts, and status fields.
7. Run `shopify app deploy` only after the previews pass. Review the generated app version and scopes before releasing it.
8. In Shopify Admin, open **Settings → Customer accounts → Customize**. Add the TIAL full-page app page to customer-account navigation and place the profile block where appropriate.
9. Verify the TIAL page is visible to a customer account. Confirm the profile block appears on the profile page. Do not publish or modify the storefront theme as part of this process.

## Security and scope boundaries

- No app client secret, Admin API token, or customer records are included in these source files.
- Customer profile and order data are queried from the authenticated customer's Customer Account API context.
- The extension does not call Admin Studio or expose Admin API credentials in the browser.
- Cross-device wishlist sync is not implemented in this phase. It requires customer metafield read/write support, the appropriate additional scopes, and privacy review.
- Customer data access remains subject to Shopify protected customer data requirements and any applicable app review/approval.
- The Admin Studio staff-side customer workspace is separate from these customer-facing extensions.

## Deployment status

Source preparation only. These files are not yet part of the actual Shopify app source project, have not been compiled with Shopify CLI, and have not been deployed or enabled in customer accounts.
