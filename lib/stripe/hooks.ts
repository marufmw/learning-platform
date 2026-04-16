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

    // Redirect to Stripe checkout using the Checkout API
    // Note: redirectToCheckout is deprecated, using fetch-based approach instead
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      console.error("Failed to initiate checkout");
      return;
    }

    // In a real implementation, you would redirect to the Stripe Checkout URL
    // For now, this scaffolds the pattern
    console.log("Checkout initiated for session:", sessionId);
  }, []);

  return { handleCheckout };
};
