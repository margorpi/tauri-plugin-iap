import { invoke, addPluginListener } from '@tauri-apps/api/core';

/**
 * Purchase state enumeration
 */
var PurchaseState;
(function (PurchaseState) {
    PurchaseState[PurchaseState["PURCHASED"] = 0] = "PURCHASED";
    PurchaseState[PurchaseState["CANCELED"] = 1] = "CANCELED";
    PurchaseState[PurchaseState["PENDING"] = 2] = "PENDING";
})(PurchaseState || (PurchaseState = {}));
/**
 * Initialize the IAP plugin.
 *
 * @deprecated This function is no longer needed. The billing client is now initialized automatically when the plugin loads. This function will be removed in the next major release.
 * @returns Promise resolving to `{ success: true }` for backward compatibility
 */
async function initialize() {
    return await invoke("plugin:iap|initialize");
}
/**
 * Fetch product information from the app store.
 *
 * @param productIds - Array of product identifiers to fetch
 * @param productType - Type of products: "subs" for subscriptions, "inapp" for one-time purchases
 * @returns Promise resolving to product information
 * @example
 * ```typescript
 * const { products } = await getProducts(
 *   ['com.example.premium', 'com.example.remove_ads'],
 *   'inapp'
 * );
 * ```
 */
async function getProducts(productIds, productType = "subs") {
    return await invoke("plugin:iap|get_products", {
        payload: {
            productIds,
            productType,
        },
    });
}
/**
 * Initiate a purchase for the specified product.
 *
 * @param productId - Product identifier to purchase
 * @param productType - Type of product: "subs" or "inapp"
 * @param options - Optional purchase parameters (platform-specific)
 * @returns Promise resolving to purchase transaction details
 * @example
 * ```typescript
 * // Simple purchase
 * const purchase = await purchase('com.example.premium', 'subs');
 *
 * // With options (iOS)
 * const purchase = await purchase('com.example.premium', 'subs', {
 *   appAccountToken: '550e8400-e29b-41d4-a716-446655440000' // Must be valid UUID
 * });
 *
 * // With options (Android)
 * const purchase = await purchase('com.example.premium', 'subs', {
 *   offerToken: 'offer_token_here',
 *   obfuscatedAccountId: 'user_account_id',
 *   obfuscatedProfileId: 'user_profile_id'
 * });
 * ```
 */
async function purchase(productId, productType = "subs", options) {
    return await invoke("plugin:iap|purchase", {
        payload: {
            productId,
            productType,
            ...options,
        },
    });
}
/**
 * Restore user's previous purchases.
 *
 * @param productType - Type of products to restore: "subs" or "inapp"
 * @returns Promise resolving to list of restored purchases
 * @example
 * ```typescript
 * const { purchases } = await restorePurchases('subs');
 * purchases.forEach(purchase => {
 *   console.log(`Restored: ${purchase.productId}`);
 * });
 * ```
 */
async function restorePurchases(productType = "subs") {
    return await invoke("plugin:iap|restore_purchases", {
        payload: {
            productType,
        },
    });
}
/**
 * Get the user's purchase history.
 * Note: Not supported on all platforms.
 *
 * @returns Promise resolving to purchase history
 * @example
 * ```typescript
 * const { history } = await getPurchaseHistory();
 * history.forEach(record => {
 *   console.log(`Purchase: ${record.productId} at ${record.purchaseTime}`);
 * });
 * ```
 */
async function getPurchaseHistory() {
    return await invoke("plugin:iap|get_purchase_history");
}
/**
 * Acknowledge a purchase (Android only).
 * Purchases must be acknowledged within 3 days or they will be refunded.
 * iOS automatically acknowledges purchases.
 *
 * @param purchaseToken - Purchase token from the transaction
 * @returns Promise resolving to acknowledgment status
 * @example
 * ```typescript
 * const result = await acknowledgePurchase(purchase.purchaseToken);
 * if (result.success) {
 *   console.log('Purchase acknowledged');
 * }
 * ```
 */
async function acknowledgePurchase(purchaseToken) {
    return await invoke("plugin:iap|acknowledge_purchase", {
        payload: {
            purchaseToken,
        },
    });
}
/**
 * Consume a purchase for consumable products (required on Android).
 *
 * For consumable products (coins, items, etc.), call this after successfully
 * delivering the product to allow repeat purchases. On Android, if not called,
 * users will see "You already own this item" on subsequent purchase attempts.
 *
 * On iOS/macOS/Windows, this is a no-op but safe to call for cross-platform code.
 * For non-consumable products or subscriptions, use `acknowledgePurchase` instead.
 *
 * @param purchaseToken - Purchase token from the transaction
 * @returns Promise resolving to consumption status
 * @example
 * ```typescript
 * const purchase = await purchase('com.example.coins_100', 'inapp');
 * await deliverProductToUser(100); // Give user the coins
 * await consumePurchase(purchase.purchaseToken); // Allow repeat purchase
 * ```
 */
async function consumePurchase(purchaseToken) {
    return await invoke("plugin:iap|consume_purchase", {
        payload: {
            purchaseToken,
        },
    });
}
/**
 * Get the current status of a product for the user.
 * Checks if the product is owned, expired, or available for purchase.
 *
 * @param productId - Product identifier to check
 * @param productType - Type of product: "subs" or "inapp"
 * @returns Promise resolving to product status
 * @example
 * ```typescript
 * const status = await getProductStatus('com.example.premium', 'subs');
 * if (status.isOwned) {
 *   console.log('User owns this product');
 *   if (status.isAutoRenewing) {
 *     console.log('Subscription is auto-renewing');
 *   }
 * }
 * ```
 */
async function getProductStatus(productId, productType = "subs") {
    return await invoke("plugin:iap|get_product_status", {
        payload: {
            productId,
            productType,
        },
    });
}
/**
 * Listen for purchase updates.
 * This event is triggered when a purchase state changes.
 *
 * @param callback - Function to call when a purchase is updated
 * @returns Promise resolving to a PluginListener that can be used to stop listening
 * @example
 * ```typescript
 * const listener = await onPurchaseUpdated((purchase) => {
 *   console.log(`Purchase updated: ${purchase.productId}`);
 *   if (purchase.purchaseState === PurchaseState.PURCHASED) {
 *     // Handle successful purchase
 *   }
 * });
 *
 * // Later, stop listening
 * await listener.unregister();
 * ```
 */
async function onPurchaseUpdated(callback) {
    return await addPluginListener("iap", "purchaseUpdated", callback);
}

export { PurchaseState, acknowledgePurchase, consumePurchase, getProductStatus, getProducts, getPurchaseHistory, initialize, onPurchaseUpdated, purchase, restorePurchases };
