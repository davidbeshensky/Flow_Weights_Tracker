"use client";

import React, { useState, useRef, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const BuyMeACoffee: React.FC = () => {
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

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

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
    <div className="relative">
      {/* Coffee Button */}
      <button
        onClick={toggleMenu}
        className="flex text-2xl items-center justify-center w-10 h-10 bg-white rounded-md shadow-md hover:bg-blue-400"
        aria-label="Buy Me a Coffee"
      >
        ☕
      </button>

      {/* Donation Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg z-50"
        >
          <h3 className="text-lg font-bold text-gray-700">Buy Me a Coffee ☕</h3>
          <p className="text-sm text-gray-500 mb-4">
            Support my ongoing addiction to supporting local business&appos;s by buying artisanal coffee.
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
        </div>
      )}
    </div>
  );
};

export default BuyMeACoffee;
