"use client";

import { useCallback } from "react";
import { getStripe } from "./client";

export const useStripeCheckout = () => {
  const handleCheckout = useCallback(async (sessionId: string) => {
    const stripe = await getStripe();

    if (!stripe) {
      console.error("Stripe failed to load");
      return;
    }

    // Redirect to Stripe checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error("Stripe checkout error:", error);
    }
  }, []);

  return { handleCheckout };
};
