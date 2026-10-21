export type ElementType = "text" | "shape";

export interface DesignElement {
  id: string;
  type: ElementType;
  /** center position, percent of sign area (0-100) */
  x: number;
  y: number;
  /** relative size, 1 = default */
  scale: number;
  /** degrees */
  rotation: number;
  /** neon color id from catalog */
  color: string;
  /** text elements */
  text?: string;
  fontId?: string;
  /** shape elements */
  shapeId?: string;
}

export interface NeonDesign {
  name: string;
  tierId: string;
  elements: DesignElement[];
  backboardId: string;
  backingColorId: string;
  accessories: string[];
  outdoor: boolean;
  sceneId: string;
  templateSlug?: string;
  /** optional customer-uploaded reference artwork (data URL) */
  uploadedImage?: string;
}

export interface PriceLine {
  label: string;
  amount: number;
}

export interface DesignPrice {
  total: number;
  lines: PriceLine[];
}

export interface CartItem {
  id: string;
  name: string;
  design: NeonDesign;
  price: number;
  qty: number;
  createdAt: number;
}

export interface OrderEvent {
  status: string;
  at: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
}

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type ArtworkStatus = "pending" | "approved" | "changes_requested";

export interface Order {
  id: string;
  items: CartItem[];
  customer: OrderCustomer;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  status: string;
  placedAt: number;
  events: OrderEvent[];
  /** admin-managed payment state (defaults to "unpaid" for new orders) */
  paymentStatus?: PaymentStatus;
  /** admin-managed artwork approval state */
  artwork?: ArtworkStatus;
  /** courier tracking number once shipped */
  tracking?: string;
  /** internal notes from the admin team */
  adminNotes?: string;
}
