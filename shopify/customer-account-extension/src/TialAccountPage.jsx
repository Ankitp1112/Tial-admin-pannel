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
      orders(first: 4, reverse: true) {
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
  try {
    return Number(amount).toLocaleString(undefined, { style: 'currency', currency });
  } catch {
    return `${amount} ${currency}`;
  }
}

function statusLabel(value, fallback) {
  return String(value ?? fallback).replaceAll('_', ' ').toLowerCase();
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

function TialAccountPage() {
  const [customer, setCustomer] = useState(null);
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
        if (errors?.length || !data?.customer) throw new Error('Account data unavailable');
        if (active) {
          setCustomer(data.customer);
          setFirstName(data.customer.firstName ?? '');
          setLastName(data.customer.lastName ?? '');
        }
      })
      .catch(() => {
        if (active) setError('Your account details could not be loaded. Please refresh to try again.');
      });
    return () => { active = false; };
  }, []);

  async function saveProfile(event) {
    event?.preventDefault?.();
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
        throw new Error(userErrors.map((item) => item.message).join(' ') || 'Your profile could not be updated.');
      }
      setCustomer((current) => ({ ...current, ...payload.customer }));
      setFirstName(payload.customer.firstName ?? '');
      setLastName(payload.customer.lastName ?? '');
      setEditing(false);
      setProfileMessage('Your TIAL profile has been updated successfully.');
    } catch (saveError) {
      setProfileError(saveError.message || 'Your profile could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <s-page heading="YOUR STYLE, YOUR SPACE">
        <s-section>
          <s-banner tone="critical">{error}</s-banner>
          <s-button href="shopify:customer-account/profile" variant="secondary">Open secure account settings</s-button>
        </s-section>
      </s-page>
    );
  }

  if (!customer) {
    return (
      <s-page heading="YOUR STYLE, YOUR SPACE">
        <s-section>
          <s-spinner size="small-100" accessibilityLabel="Loading your TIAL account" />
          <s-text color="subdued">Preparing your TIAL space…</s-text>
        </s-section>
      </s-page>
    );
  }

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'TIAL customer';
  const email = customer.emailAddress?.emailAddress ?? '';
  const phone = customer.phoneNumber?.phoneNumber ?? '';
  const orders = customer.orders?.nodes ?? [];
  const latestOrder = orders[0];

  return (
    <s-page heading="YOUR STYLE, YOUR SPACE">
      <s-section>
        <s-stack direction="block" gap="small">
          <s-badge tone="info">TIAL MEMBER SPACE</s-badge>
          <s-heading>{customer.firstName?.trim() ? `Welcome back, ${customer.firstName.trim()}.` : 'Welcome to your TIAL space.'}</s-heading>
          <s-text color="subdued">Your style, your orders, and everything you need — all in one place.</s-text>
          <s-text type="strong">{fullName}</s-text>
          {email ? <s-text color="subdued">{email}</s-text> : null}
        </s-stack>
      </s-section>

      <s-section heading="YOUR ACCOUNT">
        <s-stack direction="block" gap="base">
          <AccountDestination
            title="My Orders"
            description={latestOrder ? `Latest purchase: ${latestOrder.name} · ${money(latestOrder.totalPrice.amount, latestOrder.totalPrice.currencyCode)}` : 'Track purchases, check fulfilment updates, and view your order history.'}
            href="shopify:customer-account/orders"
            action={latestOrder ? 'Track my orders' : 'Explore orders'}
          />
          <AccountDestination
            title="Wishlist"
            description="Keep the TIAL pieces you love close and return to them whenever you like."
            href="https://tial.in/pages/wishlist"
            action="View saved styles"
          />
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="base">
              <s-heading>My TIAL Profile</s-heading>
              <s-text color="subdued">Your personal details, presented in one place.</s-text>
              {profileMessage ? <s-banner tone="success">{profileMessage}</s-banner> : null}
              {profileError ? <s-banner tone="critical">{profileError}</s-banner> : null}
              {editing ? (
                <s-form onSubmit={saveProfile}>
                  <s-stack direction="block" gap="base">
                    <s-text-field label="First name" name="firstName" value={firstName} onChange={(event) => setFirstName(event.currentTarget.value)} />
                    <s-text-field label="Last name" name="lastName" value={lastName} onChange={(event) => setLastName(event.currentTarget.value)} />
                    {email ? <s-text color="subdued">Email: {email}</s-text> : null}
                    {phone ? <s-text color="subdued">Phone: {phone}</s-text> : null}
                    <s-stack direction="inline" gap="base">
                      <s-button type="submit" disabled={saving || !firstName.trim()}> {saving ? 'Saving…' : 'Save profile'} </s-button>
                      <s-button variant="secondary" disabled={saving} onClick={() => { setFirstName(customer.firstName ?? ''); setLastName(customer.lastName ?? ''); setEditing(false); setProfileError(''); }}>Cancel</s-button>
                    </s-stack>
                  </s-stack>
                </s-form>
              ) : (
                <s-stack direction="block" gap="small">
                  <s-text type="strong">{fullName}</s-text>
                  {email ? <s-text color="subdued">{email}</s-text> : null}
                  {phone ? <s-text color="subdued">{phone}</s-text> : null}
                  <s-button variant="secondary" onClick={() => { setProfileMessage(''); setProfileError(''); setEditing(true); }}>Edit personal details</s-button>
                  <s-text color="subdued">Name changes are saved securely to your Shopify customer profile. Email and phone changes may require Shopify verification.</s-text>
                  <s-button href="shopify:customer-account/profile" variant="tertiary">Email, phone & verification settings</s-button>
                </s-stack>
              )}
            </s-stack>
          </s-box>
          <AccountDestination
            title="Addresses"
            description="Manage your saved delivery addresses for a smoother checkout."
            href="shopify:customer-account/addresses"
            action="Manage addresses"
          />
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-stack direction="inline" alignItems="center" justifyContent="space-between">
                <s-heading>Rewards</s-heading>
                <s-badge tone="info">Coming soon</s-badge>
              </s-stack>
              <s-text color="subdued">A little something extra for being part of TIAL. Our rewards experience is on its way.</s-text>
            </s-stack>
          </s-box>
          <AccountDestination
            title="Help & Support"
            description="Need help with an order, delivery, or anything TIAL? We're here for you."
            href="https://tial.in/pages/contact"
            action="Get support"
          />
        </s-stack>
      </s-section>

      <s-section heading="RECENT ACTIVITY">
        {orders.length ? (
          <s-stack direction="block" gap="base">
            {orders.slice(0, 3).map((order) => (
              <s-box key={order.id} padding="base" border="base" borderRadius="large">
                <s-stack direction="block" gap="small">
                  <s-stack direction="inline" alignItems="center" justifyContent="space-between">
                    <s-text type="strong">{order.name}</s-text>
                    <s-text type="strong">{money(order.totalPrice.amount, order.totalPrice.currencyCode)}</s-text>
                  </s-stack>
                  <s-text color="subdued">{order.processedAt ? new Date(order.processedAt).toLocaleDateString() : 'Order date unavailable'}</s-text>
                  <s-stack direction="inline" gap="small">
                    <s-badge>{statusLabel(order.financialStatus, 'payment status unavailable')}</s-badge>
                    <s-badge>{statusLabel(order.fulfillmentStatus, 'not fulfilled')}</s-badge>
                  </s-stack>
                </s-stack>
              </s-box>
            ))}
            <s-button href="shopify:customer-account/orders" variant="secondary">View all orders</s-button>
          </s-stack>
        ) : (
          <s-box padding="base" border="base" borderRadius="large">
            <s-stack direction="block" gap="small">
              <s-heading>Your TIAL story starts here.</s-heading>
              <s-text color="subdued">Your orders will appear here after your first purchase.</s-text>
              <s-button href="https://tial.in/collections/all" variant="secondary">Explore the collection</s-button>
            </s-stack>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}
