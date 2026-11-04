import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";

const MAX_CHECKS = 8;
const CHECK_INTERVAL_MS = 1500;

export default function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("Checking your payment with the studio…");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const checkoutSessionId = params.get("session_id");
    let cancelled = false;

    if (!orderId || !checkoutSessionId) {
      setError("This payment link is incomplete. Check your account or contact the studio.");
      return () => { cancelled = true; };
    }

    async function checkOrder() {
      for (let attempt = 0; attempt < MAX_CHECKS; attempt += 1) {
        if (cancelled) return;
        try {
          const result = await apiRequest(`/api/orders/${encodeURIComponent(orderId)}?session_id=${encodeURIComponent(checkoutSessionId)}`);
          if (cancelled) return;
          setOrder(result);
          if (result.status === "paid") {
            setMessage("Your payment is confirmed. Welcome to the studio!");
            return;
          }
          if (result.status === "failed") {
            setError("This order could not be completed. Please return to memberships and try again.");
            return;
          }
          setMessage("Payment received by Stripe. Waiting for the secure confirmation…");
        } catch (requestError) {
          if (cancelled) return;
          setError(requestError.message);
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, CHECK_INTERVAL_MS));
      }
      if (!cancelled) setMessage("Your payment is still being confirmed. Refresh this page in a moment to check again.");
    }

    checkOrder();
    return () => { cancelled = true; };
  }, []);

  const total = order ? new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: order.currency.toUpperCase(),
  }).format(order.totalAmount / 100) : null;

  return (
    <section className="mx-auto grid min-h-[65vh] w-full max-w-3xl content-center px-5 py-16 sm:px-8">
      <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-7 shadow-card sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-clay">Stronger Fitness checkout</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{order?.status === "paid" ? "You’re in. Let’s get stronger." : "Thanks for checking out."}</h1>
        <p className="mt-4 text-sm leading-6 text-muted" role={error ? "alert" : "status"}>{error || message}</p>
        {order && (
          <div className="mt-7 rounded-2xl bg-cream p-5">
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
              <span className="text-sm font-bold">Order #{order.id}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${order.status === "paid" ? "bg-forest/10 text-forest" : "bg-amber-100 text-amber-900"}`}>{order.status}</span>
            </div>
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex justify-between gap-4 py-4 text-sm">
                <span>{item.name} membership <span className="text-muted">× {item.quantity}</span></span>
                <span className="font-bold">{new Intl.NumberFormat(undefined, { style: "currency", currency: order.currency.toUpperCase() }).format(item.unitPrice / 100)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-ink/10 pt-4 text-base font-extrabold"><span>Total</span><span>{total}</span></div>
          </div>
        )}
        <a className="mt-7 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition hover:bg-ink" href="/#schedule">Back to the studio</a>
      </div>
    </section>
  );
}
