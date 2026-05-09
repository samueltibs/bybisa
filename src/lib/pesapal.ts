const PESAPAL_BASE = 'https://pay.pesapal.com/v3'

interface AuthResponse {
  token: string
  expiryDate: string
}

interface OrderRequest {
  id: string
  currency: string
  amount: number
  description: string
  callback_url: string
  notification_id: string
  billing_address: {
    email_address: string
    phone_number?: string
    first_name?: string
    last_name?: string
  }
}

export async function getAuthToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: import.meta.env.VITE_PESAPAL_CONSUMER_KEY,
      consumer_secret: import.meta.env.VITE_PESAPAL_CONSUMER_SECRET,
    }),
  })
  const data: AuthResponse = await res.json()
  return data.token
}

export async function registerIPN(token: string): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: import.meta.env.VITE_PESAPAL_IPN_URL || `${window.location.origin}/api/pesapal/ipn`,
      ipn_notification_type: 'GET',
    }),
  })
  const data = await res.json()
  return data.ipn_id
}

export async function submitOrder(token: string, order: OrderRequest): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(order),
  })
  const data = await res.json()
  return data.redirect_url
}

export async function getTransactionStatus(token: string, orderTrackingId: string) {
  const res = await fetch(
    `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return res.json()
}
