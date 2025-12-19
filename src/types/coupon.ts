// 優惠券
export type Coupon = {
  id: string
  title: string
  is_enabled: number
  percent: number
  due_date: number
  code: string
  num?: number
}

// 新增優惠券
export type CreateCouponParams = {
  title: string
  is_enabled: number
  percent: number
  due_date: number
  code: string
}

// 編輯優惠券
export type EditCouponParams = {
  id: string
  data: CreateCouponParams
}

// 分頁
export type Pagination = {
  total_pages: number
  current_page: number
  has_pre: boolean
  has_next: boolean
}

// 取得優惠券列表
export type GetCouponsResponse = {
  success: boolean
  coupons: Coupon[]
  pagination: Pagination
  messages: string[]
}

// 優惠券回應
export type CouponResponse = {
  success: boolean
  message: string
}

