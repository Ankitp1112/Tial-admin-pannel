import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const API_VERSION = '2026-10';
const QUERY_URL = `shopify://customer-account/api/${API_VERSION}/graphql.json`;

export default async () => {
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
        query: `query { customer { firstName lastName emailAddress { emailAddress } } }`,
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

  if (error) return <s-text color="subdued">TIAL account details are temporarily unavailable. Please refresh and try again.</s-text>;
  if (!customer) return <s-text color="subdued">TIAL account details are loading.</s-text>;

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
  return (
    <s-section heading="TIAL account">
      <s-stack direction="block" gap="small">
        <s-text type="strong">{name || 'Welcome to TIAL'}</s-text>
        <s-text color="subdued">{customer.emailAddress?.emailAddress ?? ''}</s-text>
        <s-link href="extension:tial-account">Open your TIAL account dashboard</s-link>
      </s-stack>
    </s-section>
  );
}
