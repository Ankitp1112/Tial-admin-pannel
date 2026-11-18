# TIAL Customer Account Extension

Prepared extension source for the existing **Tial Admin Connector** Shopify app.

## What is included

- A dedicated TIAL customer account page showing the signed-in customer's name, contact details, and latest five orders.
- A TIAL profile block linking back to the TIAL account dashboard.
- Shopify-native links to order history and profile management.
- Customer data is queried directly from the Customer Account API for the authenticated customer; no Admin API token is used in extension code.

## Files

- `shopify.extension.toml` — Customer Account UI extension registration and targets.
- `src/TialAccountPage.jsx` — account dashboard page.
- `src/TialProfileBlock.jsx` — profile page block.
- `APP-CONFIG.md` — exact merge and deployment instructions for the existing app.

## Not deployed yet

This repository is the TIAL Admin Studio repository, not the source project for the installed Shopify app. These files are prepared here so they can be transferred into the existing Tial Admin Connector app project. The extension will not appear in customer accounts until that app is configured, deployed, and enabled in Shopify.
