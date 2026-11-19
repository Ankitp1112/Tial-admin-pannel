import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const API_VERSION = '2026-10';
const QUERY_URL = `shopify://customer-account/api/${API_VERSION}/graphql.json`;

export default () => {
  render(<TialProfileBlock />, document.body);
};

function TialProfileBlock() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(QUERY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query TialProfileSummary {
          customer {
            firstName
            lastName
            emailAddress { emailAddress }
          }
        }`,
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Customer account request failed');
        return response.json();
      })
      .then(({ data, errors }) => {
        if (errors?.length || !data?.customer) throw new Error('Customer account data unavailable');
        if (active) setCustomer(data.customer);
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <s-section heading="YOUR TIAL SPACE">
        <s-text color="subdued">Your TIAL account details are temporarily unavailable. Please refresh and try again.</s-text>
      </s-section>
    );
  }

  if (!customer) {
    return (
      <s-section heading="YOUR TIAL SPACE">
        <s-text color="subdued">Loading your TIAL details…</s-text>
      </s-section>
    );
  }

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'TIAL member';
  const email = customer.emailAddress?.emailAddress ?? '';

  return (
    <s-section heading="YOUR TIAL SPACE">
      <s-box padding="base" border="base" borderRadius="large">
        <s-stack direction="block" gap="small">
          <s-badge tone="info">TIAL MEMBER</s-badge>
          <s-heading>{name}</s-heading>
          {email ? <s-text color="subdued">{email}</s-text> : null}
          <s-text color="subdued">Your personal details stay protected in your Shopify account.</s-text>
          <s-button href="extension:tial-account" variant="secondary">Open TIAL account hub</s-button>
        </s-stack>
      </s-box>
    </s-section>
  );
}
