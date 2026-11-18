import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const API_VERSION = '2026-10';
const ACCOUNT_API = `shopify://customer-account/api/${API_VERSION}/graphql.json`;

const CUSTOMER_QUERY = `
  query TialAccountOverview {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
      orders(first: 5, reverse: true) {
        nodes {
          id
          name
          processedAt
          totalPrice { amount currencyCode }
          financialStatus
          fulfillmentStatus
        }
      }
    }
  }
`;

export default () => {
  render(<TialAccountPage />, document.body);
};

function TialAccountPage() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetch(ACCOUNT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: CUSTOMER_QUERY }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load your TIAL account.');
        return response.json();
      })
      .then(({ data, errors }) => {
        if (errors?.length || !data?.customer) throw new Error('Shopify could not load account details.');
        if (active) setCustomer(data.customer);
      })
      .catch(() => {
        if (active) setError('We could not load your account right now. Please refresh and try again.');
      });

    return () => { active = false; };
  }, []);

  if (error) {
    return <s-page heading="Your TIAL account"><s-banner tone="critical">{error}</s-banner></s-page>;
  }

  if (!customer) {
    return <s-page heading="Your TIAL account"><s-spinner /><s-text>Loading your account…</s-text></s-page>;
  }

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'TIAL customer';
  const orders = customer.orders?.nodes ?? [];

  return (
    <s-page heading="Your TIAL account">
      <s-section heading="Welcome back">
        <s-stack direction="block" gap="small">
          <s-heading>{fullName}</s-heading>
          <s-text color="subdued">{customer.emailAddress?.emailAddress ?? ''}</s-text>
          {customer.phoneNumber?.phoneNumber ? <s-text color="subdued">{customer.phoneNumber.phoneNumber}</s-text> : null}
        </s-stack>
        <s-button slot="primary-action" href="shopify:customer-account/profile">Manage profile</s-button>
      </s-section>

      <s-section heading="Recent orders">
        {orders.length ? (
          <s-stack direction="block" gap="base">
            {orders.map((order) => (
              <s-box key={order.id} padding="base" border="base" borderRadius="base">
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                  <s-text type="strong">{order.name}</s-text>
                  <s-text>{Number(order.totalPrice.amount).toLocaleString(undefined, { style: 'currency', currency: order.totalPrice.currencyCode })}</s-text>
                </s-stack>
                <s-text color="subdued">{order.processedAt ? new Date(order.processedAt).toLocaleDateString() : 'Order date unavailable'}</s-text>
                <s-stack direction="inline" gap="small">
                  <s-badge>{String(order.financialStatus ?? 'Payment status unavailable').replaceAll('_', ' ')}</s-badge>
                  <s-badge>{String(order.fulfillmentStatus ?? 'Not fulfilled').replaceAll('_', ' ')}</s-badge>
                </s-stack>
              </s-box>
            ))}
            <s-button href="shopify:customer-account/orders" variant="secondary">View all orders</s-button>
          </s-stack>
        ) : (
          <s-text color="subdued">Your orders will appear here after your first purchase.</s-text>
        )}
      </s-section>

      <s-section heading="Your TIAL experience">
        <s-text>Keep your details up to date and follow every purchase from one place.</s-text>
        <s-stack direction="inline" gap="base">
          <s-button href="shopify:customer-account/profile" variant="secondary">Profile & addresses</s-button>
          <s-button href="shopify:customer-account/orders" variant="secondary">Order history</s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}
