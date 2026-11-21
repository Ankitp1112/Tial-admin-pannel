import '@shopify/ui-extensions/preact';
import { render } from 'preact';

export default () => {
  render(<TialAccountPage />, document.body);
};

function TialAccountPage() {
  return (
    <s-section>
      <s-heading>TIAL Account is running</s-heading>
      <s-text>Welcome to your TIAL customer account.</s-text>
      <s-text>This is a rendering diagnostic for the full-page account extension.</s-text>
      <s-button href="shopify:customer-account/orders">View my orders</s-button>
    </s-section>
  );
}
