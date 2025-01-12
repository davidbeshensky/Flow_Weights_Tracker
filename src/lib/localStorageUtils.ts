import { supabaseClient } from "@/lib/supabaseClient";

/**
 * Get the user ID of the current logged-in user.
 */
const getUserId = async (): Promise<string | null> => {
  const { data: session } = await supabaseClient.auth.getSession();
  return session?.session?.user.id || null;
};

/**
 * Generate a namespaced key for localStorage.
 */
const getKey = async (key: string): Promise<string | null> => {
  const userId = await getUserId();
  return userId ? `${key}_${userId}` : null;
};

/**
 * Get an item from localStorage, namespaced by user.
 */
export const getItem = async (key: string): Promise<any | null> => {
  const namespacedKey = await getKey(key);
  if (!namespacedKey) return null;
  const item = localStorage.getItem(namespacedKey);
  return item ? JSON.parse(item) : null;
};

/**
 * Set an item in localStorage, namespaced by user.
 */
export const setItem = async (key: string, value: any): Promise<void> => {
  const namespacedKey = await getKey(key);
  if (!namespacedKey) return;
  localStorage.setItem(namespacedKey, JSON.stringify(value));
};

/**
 * Remove an item from localStorage, namespaced by user.
 */
export const removeItem = async (key: string): Promise<void> => {
  const namespacedKey = await getKey(key);
  if (!namespacedKey) return;
  localStorage.removeItem(namespacedKey);
};

/**
 * Clear all items for the current user from localStorage.
 */
export const clearUserStorage = async (): Promise<void> => {
  const userId = await getUserId();
  if (!userId) return;

  Object.keys(localStorage).forEach((key) => {
    if (key.endsWith(`_${userId}`)) {
      localStorage.removeItem(key);
    }
  });
};
