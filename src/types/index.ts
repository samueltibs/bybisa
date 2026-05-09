export interface Product {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  currency: 'UGX' | 'USD'
  category: 'template' | 'guide' | 'formula' | 'course' | 'bundle'
  product_type: string | null
  preview_image_url: string | null
  preview_pdf_url: string | null
  file_url: string | null
  file_size_bytes: number | null
  file_type: 'pdf' | 'xlsx' | 'docx' | 'zip' | 'pptx' | null
  is_active: boolean
  is_featured: boolean
  tags: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  email: string
  name: string | null
  phone: string | null
  created_at: string
}

export interface Purchase {
  id: string
  customer_id: string
  product_id: string
  order_number: string
  amount: number
  currency: string
  payment_method: string | null
  payment_reference: string | null
  pesapal_tracking_id: string | null
  status: 'pending' | 'paid' | 'refunded' | 'failed'
  download_token: string
  download_count: number
  max_downloads: number
  purchased_at: string
  // Joined
  product?: Product
  customer?: Customer
}

export interface Download {
  id: string
  purchase_id: string
  downloaded_at: string
  ip_address: string | null
  user_agent: string | null
}

export interface Review {
  id: string
  product_id: string
  customer_id: string
  rating: number
  review_text: string | null
  is_verified_purchase: boolean
  created_at: string
  customer?: Customer
}

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface AnalyticsEvent {
  id: string
  event_type: 'view' | 'add_to_cart' | 'purchase' | 'download'
  product_id: string | null
  customer_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}
