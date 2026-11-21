import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default async function extension() {
  render(<TialAccountPage />, document.body);
}

function TialAccountPage() {
  return (
    <s-page heading="YOUR STYLE, YOUR SPACE" subheading="The TIAL customer account hub">
      <s-stack direction="block" gap="base">
        <s-banner tone="success">TIAL Account extension is running.</s-banner>
        <s-heading>Welcome to TIAL</s-heading>
        <s-text>Your customer account dashboard is connected.</s-text>
        <s-button href="shopify:customer-account/orders" variant="primary">View my orders</s-button>
        <s-button href="shopify:customer-account/profile" variant="secondary">Manage my profile</s-button>
      </s-stack>
    </s-page>
  );
}
