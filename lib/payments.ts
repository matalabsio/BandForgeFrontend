import { ApiError, parseApiError, parseJsonResponse, type ApiErrorBody } from "@/lib/api";

export type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  duration_days: number;
  sort_order: number;
};

export type CheckoutContact = {
  name: string | null;
  email: string | null;
  contact: string | null;
};

export type CreateOrderResult = {
  order_id: string;
  key_id: string;
  amount: number;
  currency: string;
  plan_name: string;
  checkout_contact: CheckoutContact;
};

export type Subscription = {
  is_active: boolean;
  plan_slug: string | null;
  plan_name: string | null;
  status: string | null;
  starts_at: string | null;
  expires_at: string | null;
};

export type PaymentHistoryItem = {
  id: string;
  plan_name: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

async function paymentsCall<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/payments${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await parseJsonResponse<T | ApiErrorBody>(res);
  if (!res.ok) {
    throw new ApiError(parseApiError(body as ApiErrorBody, res.status), res.status);
  }
  return body as T;
}

export function getPlans(): Promise<{ plans: Plan[] }> {
  return paymentsCall<{ plans: Plan[] }>("/plans");
}

export function createOrder(planSlug: string): Promise<CreateOrderResult> {
  return paymentsCall<CreateOrderResult>("/create-order", {
    method: "POST",
    body: JSON.stringify({ plan_slug: planSlug }),
  });
}

export function verifyPayment(
  response: RazorpayHandlerResponse,
): Promise<{ ok: boolean; subscription: Subscription }> {
  return paymentsCall<{ ok: boolean; subscription: Subscription }>("/verify", {
    method: "POST",
    body: JSON.stringify(response),
  });
}

export function getSubscription(): Promise<Subscription> {
  return paymentsCall<Subscription>("/subscription");
}

export function getPaymentHistory(): Promise<{ payments: PaymentHistoryItem[] }> {
  return paymentsCall<{ payments: PaymentHistoryItem[] }>("/history");
}

/** Display helper: backend stores amounts in paise. */
export function formatInr(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

// --- Razorpay checkout script + popup -------------------------------------

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = { open: () => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open the hosted Razorpay checkout. Only minimal data (amount, currency,
 * order id, key, and name/email/phone prefill) is passed — no learning,
 * diagnostic, or behavioural data.
 */
export async function openRazorpayCheckout(opts: {
  order: CreateOrderResult;
  onSuccess: (response: RazorpayHandlerResponse) => void;
  onDismiss: () => void;
}): Promise<boolean> {
  const ok = await loadRazorpayScript();
  if (!ok || !window.Razorpay) return false;

  const { order } = opts;
  const rzp = new window.Razorpay({
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    name: "BandForge",
    description: "BandForge Subscription",
    order_id: order.order_id,
    handler: opts.onSuccess,
    prefill: {
      name: order.checkout_contact.name ?? undefined,
      email: order.checkout_contact.email ?? undefined,
      contact: order.checkout_contact.contact ?? undefined,
    },
    theme: { color: "#0d1f3c" },
    modal: { ondismiss: opts.onDismiss },
  });
  rzp.open();
  return true;
}
