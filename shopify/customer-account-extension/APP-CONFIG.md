# TIAL Admin Connector — app configuration patch

Apply this to the existing **Tial Admin Connector** app configuration. Do not create a second app and do not rotate or expose credentials.

## Required Customer Account API scope

Merge the following scope into the app's existing `shopify.app.toml` `[access_scopes]` list. Preserve every existing scope:

```toml
[access_scopes]
scopes = "..., customer_read_customers"
```

This is separate from the existing Admin API `read_customers` scope. The extension reads the signed-in customer's own profile and order data through Shopify's Customer Account API.

## Extension registration

Copy the contents of this folder into the existing app project under:

```
extensions/tial-account/
```

The extension config deliberately omits `uid`: Shopify CLI generates and manages that identifier when the extension is scaffolded/registered. Do not invent one or change the handle after deployment.

## Deployment checklist

1. Open the existing Tial Admin Connector app project.
2. Merge the Customer Account API scope above into its existing `shopify.app.toml`.
3. Run `shopify app generate extension --template customer_account_ui --name tial-account` if the CLI project requires a generated extension scaffold; otherwise copy these prepared files into `extensions/tial-account/`.
4. Keep the generated `uid` in the generated extension TOML if Shopify CLI adds one; retain this package's targets, modules, API version, and capabilities.
5. Run `shopify app dev` and preview the TIAL Account page and Profile block against the development store.
6. Run `shopify app deploy` and confirm the app version containing **TIAL Account**.
7. In Shopify Admin, open **Settings → Customer accounts → Customize** and add/enable the TIAL Account extension page if Shopify presents it as an available page/extension.
8. Test with a customer account that has orders and another account with no orders.
9. Confirm the new page appears in the Customer Account pages list. Do not publish the storefront theme as part of this process.

## Important boundaries

- This package does not contain an app client secret, Admin API token, or customer data.
- The extension only queries the authenticated customer's own profile and last five orders using the Customer Account API.
- It does not call the Admin Studio endpoint from the browser and does not expose Admin API credentials.
- The existing Admin Studio customer workspace remains the staff-side customer view.
- Cross-device wishlist sync is a separate next phase. Implement it with customer metafields via the Customer Account API (including the appropriate write scope and consent/privacy review), not browser localStorage. Do not enable write scopes until that feature is implemented and reviewed.
- Customer data access is subject to Shopify protected customer data requirements and app review/approval where applicable.
