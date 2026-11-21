import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const API_VERSION = '2026-10';
const CUSTOMER_API = `shopify://customer-account/api/${API_VERSION}/graphql.json`;

export default () => {
  render(<TialAccount />, document.body);
};

function TialAccount() {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch(CUSTOMER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query TialAccountHome {
          customer {
            firstName
            lastName
            emailAddress { emailAddress }
            orders(first: 3, reverse: true) {
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
        if (!response.ok) throw new Error('Customer account request failed');
        return response.json();
      })
      .then(({ data, errors }) => {
        if (errors?.length || !data?.customer) throw new Error('Customer account unavailable');
        if (mounted) {
          setCustomer(data.customer);
          setOrders(data.customer.orders?.nodes ?? []);
        }
      })
      .catch(() => {
        if (mounted) setLoadError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const name = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'there'
    : 'there';
  const email = customer?.emailAddress?.emailAddress ?? '';

  return (
    <s-page heading="MY TIAL" subheading="Your personal space at TIAL">
      <s-section>
        <s-box padding="large" border="base" borderRadius="large">
          <s-stack direction="block" gap="base">
            <s-text>TIAL CUSTOMER CLUB</s-text>
            <s-heading>Welcome back{name !== 'there' ? `, ${name}` : ''}.</s-heading>
            <s-text>Your orders, profile and delivery details — all in one place.</s-text>
            {email ? <s-text color="subdued">{email}</s-text> : null}
            {loading ? <s-text color="subdued">Loading your Shopify account…</s-text> : null}
            {loadError ? (
              <s-banner tone="critical">We couldn't load your account details. Your Shopify account remains safe. Please open Orders or Profile below.</s-banner>
            ) : null}
          </s-stack>
        </s-box>
      </s-section>

      <s-section heading="YOUR ACCOUNT">
        <s-grid gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="base">
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-heading>My orders</s-heading>
              <s-text color="subdued">Track purchases and check delivery updates.</s-text>
              <s-button href="shopify:customer-account/orders">View orders</s-button>
            </s-stack>
          </s-box>
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-heading>My profile</s-heading>
              <s-text color="subdued">Manage your personal information and email.</s-text>
              <s-button href="shopify:customer-account/profile">Edit profile</s-button>
            </s-stack>
          </s-box>
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-heading>Delivery addresses</s-heading>
              <s-text color="subdued">Manage your saved shipping addresses.</s-text>
              <s-button href="shopify:customer-account/profile">Manage addresses</s-button>
            </s-stack>
          </s-box>
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-heading>Help & support</s-heading>
              <s-text color="subdued">Get help with an order or your account.</s-text>
              <s-button href="shopify:customer-account/orders">Find an order</s-button>
            </s-stack>
          </s-box>
        </s-grid>
      </s-section>

      <s-section heading="RECENT ORDERS">
        {loading ? (
          <s-text color="subdued">Fetching your latest orders…</s-text>
        ) : loadError ? (
          <s-text color="subdued">Your order history is available in the secure Shopify Orders page.</s-text>
        ) : orders.length === 0 ? (
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-heading>Your TIAL journey starts here.</s-heading>
              <s-text color="subdued">You don't have any orders yet.</s-text>
              <s-button href="shopify:customer-account/orders">Open orders</s-button>
            </s-stack>
          </s-box>
        ) : (
          <s-stack direction="block" gap="base">
            {orders.map((order) => (
              <s-box key={order.id} padding="base" border="base" borderRadius="large">
                <s-stack direction="block" gap="small">
                  <s-heading>{order.name}</s-heading>
                  <s-text color="subdued">{order.processedAt ? new Date(order.processedAt).toLocaleDateString() : 'Date unavailable'}</s-text>
                  <s-text>{order.totalPrice?.amount ?? ''} {order.totalPrice?.currencyCode ?? ''}</s-text>
                  <s-text>Payment: {String(order.financialStatus ?? 'Unavailable').replaceAll('_', ' ').toLowerCase()}</s-text>
                  <s-text>Delivery: {String(order.fulfillmentStatus ?? 'Unfulfilled').replaceAll('_', ' ').toLowerCase()}</s-text>
                </s-stack>
              </s-box>
            ))}
            <s-button href="shopify:customer-account/orders" variant="primary">View all orders</s-button>
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}
