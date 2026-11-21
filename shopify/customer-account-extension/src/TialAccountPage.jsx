import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const API_VERSION = '2026-10';
const CUSTOMER_ACCOUNT_API = `shopify://customer-account/api/${API_VERSION}/graphql.json`;

export default () => {
  render(<TialCustomerHub />, document.body);
};

function TialCustomerHub() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(CUSTOMER_ACCOUNT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query TialCustomerHub {
          customer {
            firstName
            lastName
            emailAddress { emailAddress }
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
        }`,
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Customer account API request failed');
        return response.json();
      })
      .then(({ data, errors }) => {
        if (errors?.length || !data?.customer) throw new Error('Customer data unavailable');
        if (active) setCustomer(data.customer);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const fullName = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'TIAL customer'
    : '';

  return (
    <s-page heading="YOUR TIAL ACCOUNT" subheading="Your orders and profile, connected securely to Shopify">
      <s-section heading="MY ACCOUNT">
        {loading ? (
          <s-text>Loading your Shopify account…</s-text>
        ) : error ? (
          <s-banner tone="critical">We couldn't load your account details. Please sign in again or open your Shopify profile.</s-banner>
        ) : (
          <s-stack direction="block" gap="base">
            <s-heading>Welcome back, {fullName}</s-heading>
            {customer.emailAddress?.emailAddress ? <s-text>{customer.emailAddress.emailAddress}</s-text> : null}
            <s-button href="shopify:customer-account/profile" variant="secondary">Manage profile</s-button>
          </s-stack>
        )}
      </s-section>
      <s-section heading="RECENT ORDERS">
        {!loading && !error && customer?.orders?.nodes?.length ? (
          <s-stack direction="block" gap="base">
            {customer.orders.nodes.map((order) => (
              <s-box key={order.id} padding="base" border="base" borderRadius="large">
                <s-stack direction="block" gap="small">
                  <s-heading>{order.name}</s-heading>
                  <s-text>{order.processedAt ? new Date(order.processedAt).toLocaleDateString() : 'Date unavailable'}</s-text>
                  <s-text>{order.totalPrice.amount} {order.totalPrice.currencyCode}</s-text>
                  <s-text>Payment: {String(order.financialStatus ?? 'Unavailable').replaceAll('_', ' ').toLowerCase()}</s-text>
                  <s-text>Fulfilment: {String(order.fulfillmentStatus ?? 'Unfulfilled').replaceAll('_', ' ').toLowerCase()}</s-text>
                </s-stack>
              </s-box>
            ))}
            <s-button href="shopify:customer-account/orders" variant="secondary">View all orders</s-button>
          </s-stack>
        ) : !loading && !error ? (
          <s-text>Your Shopify orders will appear here after your first purchase.</s-text>
        ) : null}
      </s-section>
    </s-page>
  );
}
