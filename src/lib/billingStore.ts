import { INVOICES, type ResidentBilling, type Invoice } from "./mock/billing";

// ── Resident store (CRM → Billing move-in flow) ───────────────────────────────

export interface OccupiedRoom {
  residentName: string;
  moveInDate: string;
  wing: string;
}

const _newResidents: ResidentBilling[] = [];
const _occupiedRooms = new Map<string, OccupiedRoom>();

export function addResidentToBilling(r: ResidentBilling): void {
  _newResidents.push(r);
}

export function getNewResidents(): ResidentBilling[] {
  return [..._newResidents];
}

export function markRoomOccupied(room: string, info: OccupiedRoom): void {
  _occupiedRooms.set(room, info);
}

export function getOccupiedRooms(): Map<string, OccupiedRoom> {
  return new Map(_occupiedRooms);
}

// ── Invoice store (payment link / checkout flow) ───────────────────────────────
// Pre-seeded with mock data so checkout page works even if billing module hasn't
// mounted yet. BillingModule.syncInvoicesToStore() keeps this current.

const _invoiceMap = new Map<string, Invoice>(INVOICES.map((inv) => [inv.id, inv]));

export function syncInvoicesToStore(invoices: Invoice[]): void {
  for (const inv of invoices) _invoiceMap.set(inv.id, inv);
}

export function getStoredInvoice(id: string): Invoice | undefined {
  return _invoiceMap.get(id);
}

// ── Checkout payment queue ─────────────────────────────────────────────────────
// Checkout page queues a payment; BillingModule drains on window focus / mount.

export interface CheckoutPayment {
  invoiceId: string;
  method: string;
  paidAt: string;
}

const _checkoutPayments: CheckoutPayment[] = [];

export function queueCheckoutPayment(invoiceId: string, method: string): void {
  _checkoutPayments.push({ invoiceId, method, paidAt: new Date().toISOString() });
}

export function consumeCheckoutPayments(): CheckoutPayment[] {
  return _checkoutPayments.splice(0);
}
