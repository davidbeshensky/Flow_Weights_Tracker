"use client";

import React, { useState, useRef, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your public key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ""
);

type BuyMeACoffeeProps = {
  toggleMenu: () => void;
};

const BuyMeACoffee: React.FC<BuyMeACoffeeProps> = ({ toggleMenu }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleDonateOnce = async () => {
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({
      lineItems: [
        {
          price: "price_1QegiTHp5lDRgtYmzBxeYh5n", // Replace with your Stripe price ID
          quantity: 1,
        },
      ],
      mode: "payment",
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/cancel`,
    });
  };

  const handleSubscribe = async () => {
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({
      lineItems: [
        {
          price: "price_1QeghBHp5lDRgtYm8EJdK6c3", // Replace with your Stripe subscription price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/cancel`,
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div
      ref={menuRef}
      className="fixed w-3/4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-50"
    >
      <h3 className="text-lg font-bold text-gray-700">Buy Me a Coffee ☕</h3>
      <p className="text-sm text-gray-500 mb-4">
        Support my ongoing addiction to supporting local business&apos;s by
        buying artisanal coffee.
      </p>
      <button
        onClick={handleDonateOnce}
        className="w-full px-4 py-2 mb-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Donate $5 ☕
      </button>
      <button
        onClick={handleSubscribe}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Subscribe $5/month ❤️
      </button>
      <button
        onClick={toggleMenu}
        className="w-full px-4 py-2 mt-4 text-white bg-gray-500 rounded-md hover:bg-gray-600"
      >
        Close
      </button>
    </div>
  );
};

export default BuyMeACoffee;
