import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

const API_VERSION = '2026-10';
const ACCOUNT_API = `shopify://customer-account/api/${API_VERSION}/graphql.json`;
const STOREFRONT = 'https://rh2wpy-1u.myshopify.com';

const CUSTOMER_QUERY = `
  query TialAccountOverview {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
      orders(first: 3, sortKey: PROCESSED_AT, reverse: true) {
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

const UPDATE_CUSTOMER = `
  mutation TialUpdateCustomer($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer { firstName lastName }
      userErrors { field message code }
    }
  }
`;

export default () => {
  render(<TialAccountPage />, document.body);
};

function money(amount, currency) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || !currency) return 'Amount unavailable';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency}`;
  }
}

function statusLabel(value, fallback) {
  if (!value) return fallback;
  const labels = {
    PAID: 'Paid',
    PENDING: 'Payment pending',
    PARTIALLY_PAID: 'Partially paid',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Partially refunded',
    FULFILLED: 'Fulfilled',
    UNFULFILLED: 'Unfulfilled',
    PARTIALLY_FULFILLED: 'Partially fulfilled',
    IN_PROGRESS: 'In progress',
    ON_HOLD: 'On hold',
  };
  return labels[value] || String(value).replaceAll('_', ' ').toLowerCase();
}

function dateLabel(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function AccountDestination({ title, description, href, action = 'Open' }) {
  return (
    <s-box padding="base" border="base" borderRadius="large">
      <s-stack direction="block" gap="small">
        <s-heading>{title}</s-heading>
        <s-text color="subdued">{description}</s-text>
        <s-button href={href} variant="secondary">{action}</s-button>
      </s-stack>
    </s-box>
  );
}

function OrderCard({ order }) {
  return (
    <s-box padding="base" border="base" borderRadius="large">
      <s-stack direction="block" gap="small">
        <s-stack direction="inline" alignItems="center" justifyContent="space-between">
          <s-text type="strong">{order.name}</s-text>
          <s-text type="strong">{money(order.totalPrice?.amount, order.totalPrice?.currencyCode)}</s-text>
        </s-stack>
        <s-text color="subdued">{dateLabel(order.processedAt)}</s-text>
        <s-stack direction="inline" gap="small">
          <s-badge>{statusLabel(order.financialStatus, 'Payment status unavailable')}</s-badge>
          <s-badge>{statusLabel(order.fulfillmentStatus, 'Unfulfilled')}</s-badge>
        </s-stack>
      </s-stack>
    </s-box>
  );
}

function TialAccountPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(ACCOUNT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: CUSTOMER_QUERY }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Account request failed');
        return response.json();
      })
      .then(({ data, errors }) => {
        if (errors?.length || !data?.customer) {
          throw new Error(errors?.[0]?.message || 'Account data unavailable');
        }
        if (active) {
          setCustomer(data.customer);
          setFirstName(data.customer.firstName ?? '');
          setLastName(data.customer.lastName ?? '');
        }
      })
      .catch(() => {
        if (active) setError('We could not load your TIAL account details. Please refresh and try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function saveProfile(event) {
    event?.preventDefault?.();
    if (!firstName.trim()) {
      setProfileError('Please enter your first name.');
      return;
    }
    setSaving(true);
    setProfileMessage('');
    setProfileError('');
    try {
      const response = await fetch(ACCOUNT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: UPDATE_CUSTOMER,
          variables: { input: { firstName: firstName.trim(), lastName: lastName.trim() } },
        }),
      });
      if (!response.ok) throw new Error('We could not save your profile. Please try again.');
      const result = await response.json();
      const payload = result?.data?.customerUpdate;
      const userErrors = payload?.userErrors ?? [];
      if (result.errors?.length || userErrors.length || !payload?.customer) {
        throw new Error(userErrors.map((item) => item.message).join(' ') || result.errors?.[0]?.message || 'Your profile could not be updated.');
      }
      setCustomer((current) => ({ ...current, ...payload.customer }));
      setFirstName(payload.customer.firstName ?? '');
      setLastName(payload.customer.lastName ?? '');
      setEditing(false);
      setProfileMessage('Your TIAL profile has been updated.');
    } catch (saveError) {
      setProfileError(saveError.message || 'Your profile could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <s-page heading="MY ACCOUNT">
        <s-section>
          <s-spinner size="small-100" accessibilityLabel="Loading your TIAL account" />
          <s-text color="subdued">Loading your TIAL account…</s-text>
        </s-section>
      </s-page>
    );
  }

  if (error || !customer) {
    return (
      <s-page heading="MY ACCOUNT">
        <s-section>
          <s-banner tone="critical">{error || 'Your account details are temporarily unavailable.'}</s-banner>
          <s-button href="shopify:customer-account/profile" variant="secondary">Open secure account settings</s-button>
          <s-button href="shopify:customer-account/orders" variant="tertiary">View orders</s-button>
        </s-section>
      </s-page>
    );
  }

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'TIAL customer';
  const email = customer.emailAddress?.emailAddress ?? '';
  const phone = customer.phoneNumber?.phoneNumber ?? '';
  const orders = customer.orders?.nodes ?? [];

  return (
    <s-page heading="MY ACCOUNT">
      <s-section>
        <s-stack direction="block" gap="small">
          <s-badge tone="info">TIAL MEMBER</s-badge>
          <s-heading>{customer.firstName?.trim() ? `Welcome back, ${customer.firstName.trim()}.` : 'Welcome to TIAL.'}</s-heading>
          <s-text color="subdued">Your orders, details and saved addresses — together in one place.</s-text>
          <s-text type="strong">{fullName}</s-text>
          {email ? <s-text color="subdued">{email}</s-text> : null}
        </s-stack>
      </s-section>

      <s-section heading="ORDER HISTORY">
        {orders.length ? (
          <s-stack direction="block" gap="base">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
            <s-button href="shopify:customer-account/orders" variant="secondary">View all orders</s-button>
          </s-stack>
        ) : (
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-heading>No orders yet</s-heading>
              <s-text color="subdued">When you place your first TIAL order, it will appear here.</s-text>
              <s-button href={`${STOREFRONT}/collections/all`} variant="secondary">Explore TIAL</s-button>
            </s-stack>
          </s-box>
        )}
      </s-section>

      <s-section heading="ACCOUNT DETAILS">
        <s-box padding="base" border="base" borderRadius="large">
          <s-stack direction="block" gap="base">
            {profileMessage ? <s-banner tone="success">{profileMessage}</s-banner> : null}
            {profileError ? <s-banner tone="critical">{profileError}</s-banner> : null}
            {editing ? (
              <s-form onSubmit={saveProfile}>
                <s-stack direction="block" gap="base">
                  <s-text-field label="First name" name="firstName" value={firstName} onChange={(event) => setFirstName(event.currentTarget.value)} />
                  <s-text-field label="Last name" name="lastName" value={lastName} onChange={(event) => setLastName(event.currentTarget.value)} />
                  <s-text color="subdued">Email and phone changes are managed through Shopify's secure verification flow.</s-text>
                  <s-stack direction="inline" gap="base">
                    <s-button type="submit" disabled={saving || !firstName.trim()}>{saving ? 'Saving…' : 'Save changes'}</s-button>
                    <s-button variant="secondary" disabled={saving} onClick={() => { setFirstName(customer.firstName ?? ''); setLastName(customer.lastName ?? ''); setEditing(false); setProfileError(''); }}>Cancel</s-button>
                  </s-stack>
                </s-stack>
              </s-form>
            ) : (
              <s-stack direction="block" gap="small">
                <s-text type="strong">{fullName}</s-text>
                {email ? <s-text color="subdued">{email}</s-text> : null}
                {phone ? <s-text color="subdued">{phone}</s-text> : null}
                <s-button variant="secondary" onClick={() => { setProfileMessage(''); setProfileError(''); setEditing(true); }}>Edit name</s-button>
                <s-button href="shopify:customer-account/profile" variant="tertiary">Manage email and phone</s-button>
              </s-stack>
            )}
          </s-stack>
        </s-box>
      </s-section>

      <s-section heading="SAVED ADDRESSES">
        <AccountDestination
          title="Delivery addresses"
          description="Add, edit or remove saved addresses and choose your default delivery address."
          href="shopify:customer-account/addresses"
          action="Manage addresses"
        />
      </s-section>

      <s-section heading="MORE FROM TIAL">
        <s-stack direction="block" gap="base">
          <AccountDestination
            title="Wishlist"
            description="Return to the styles you have saved."
            href={`${STOREFRONT}/pages/wishlist`}
            action="View wishlist"
          />
          <AccountDestination
            title="Help & support"
            description="Get help with orders, delivery, returns or product questions."
            href={`${STOREFRONT}/pages/contact`}
            action="Contact TIAL"
          />
        </s-stack>
      </s-section>
    </s-page>
  );
}
