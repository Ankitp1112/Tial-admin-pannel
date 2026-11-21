import '@shopify/ui-extensions/preact';
import { render } from 'preact';

// Shopify's documented full-page extension entry-point pattern.
export default async () => {
  render(<TialAccountPage />, document.body);
};

function TialAccountPage() {
  return (
    <s-page heading="TIAL ACCOUNT" subheading="Your TIAL customer space">
      <s-section heading="WELCOME TO TIAL">
        <s-text>YOUR TIAL ACCOUNT PAGE IS CONNECTED.</s-text>
        <s-text>This page is now running inside your Shopify customer account.</s-text>
        <s-button href="shopify:customer-account/orders" variant="primary">
          VIEW MY ORDERS
        </s-button>
        <s-button href="shopify:customer-account/profile" variant="secondary">
          MANAGE MY PROFILE
        </s-button>
      </s-section>
    </s-page>
  );
}
