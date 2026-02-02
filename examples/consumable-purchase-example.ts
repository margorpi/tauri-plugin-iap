/**
 * 消耗型商品购买完整示例
 * Example: Complete flow for purchasing consumable products
 */

import { 
  purchase, 
  consumePurchase, 
  PurchaseState,
  type Purchase 
} from 'tauri-plugin-iap';

/**
 * 购买消耗型商品的完整流程
 * Complete flow for purchasing a consumable product
 */
async function purchaseConsumableProduct(productId: string): Promise<boolean> {
  try {
    console.log(`开始购买: ${productId}`);
    
    // 1. 发起购买
    const purchaseResult: Purchase = await purchase(productId, 'inapp');
    
    // 2. 检查购买状态
    if (purchaseResult.purchaseState !== PurchaseState.PURCHASED) {
      console.error('购买未完成');
      return false;
    }
    
    console.log('购买成功！', {
      orderId: purchaseResult.orderId,
      productId: purchaseResult.productId,
      purchaseToken: purchaseResult.purchaseToken
    });
    
    // 3. 验证购买（推荐：发送到服务器验证）
    const isValid = await verifyPurchaseWithServer(purchaseResult);
    if (!isValid) {
      console.error('购买验证失败');
      return false;
    }
    
    // 4. 发放商品给用户
    const delivered = await deliverProductToUser(productId);
    if (!delivered) {
      console.error('商品发放失败');
      // 保存购买信息，稍后重试
      await savePendingPurchase(purchaseResult);
      return false;
    }
    
    // 5. 消耗购买（Android 必需）
    try {
      const consumeResult = await consumePurchase(purchaseResult.purchaseToken);
      if (consumeResult.success) {
        console.log('购买已消耗，用户可以再次购买');
      }
    } catch (error) {
      console.error('消耗购买失败:', error);
      // 保存以便稍后重试
      await savePendingConsumption(purchaseResult.purchaseToken);
    }
    
    return true;
    
  } catch (error) {
    console.error('购买过程出错:', error);
    return false;
  }
}

/**
 * 服务器端验证购买（推荐）
 * Server-side purchase verification (recommended)
 */
async function verifyPurchaseWithServer(purchase: Purchase): Promise<boolean> {
  try {
    const response = await fetch('https://your-api.com/verify-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purchaseToken: purchase.purchaseToken,
        productId: purchase.productId,
        // Android specific
        signature: purchase.signature,
        originalJson: purchase.originalJson,
        // iOS/macOS specific
        jwsRepresentation: purchase.jwsRepresentation,
      }),
    });
    
    const result = await response.json();
    return result.valid === true;
  } catch (error) {
    console.error('服务器验证失败:', error);
    return false;
  }
}

/**
 * 发放商品给用户
 * Deliver product to user
 */
async function deliverProductToUser(productId: string): Promise<boolean> {
  try {
    // 根据 productId 发放相应的商品
    switch (productId) {
      case 'com.example.coins_100':
        await addCoinsToUserAccount(100);
        break;
      case 'com.example.coins_500':
        await addCoinsToUserAccount(500);
        break;
      case 'com.example.coins_1000':
        await addCoinsToUserAccount(1000);
        break;
      default:
        console.error('未知的商品ID:', productId);
        return false;
    }
    
    console.log(`商品已发放: ${productId}`);
    return true;
  } catch (error) {
    console.error('发放商品失败:', error);
    return false;
  }
}

/**
 * 给用户账户添加金币
 * Add coins to user account
 */
async function addCoinsToUserAccount(amount: number): Promise<void> {
  // 实现你的业务逻辑
  // 例如：更新本地数据库、调用后端 API 等
  console.log(`添加 ${amount} 金币到用户账户`);
}

/**
 * 保存待处理的购买（用于重试）
 * Save pending purchase for retry
 */
async function savePendingPurchase(purchase: Purchase): Promise<void> {
  // 保存到本地存储，稍后重试
  const pending = JSON.parse(localStorage.getItem('pendingPurchases') || '[]');
  pending.push(purchase);
  localStorage.setItem('pendingPurchases', JSON.stringify(pending));
}

/**
 * 保存待消耗的购买令牌
 * Save pending consumption token
 */
async function savePendingConsumption(purchaseToken: string): Promise<void> {
  const pending = JSON.parse(localStorage.getItem('pendingConsumptions') || '[]');
  pending.push(purchaseToken);
  localStorage.setItem('pendingConsumptions', JSON.stringify(pending));
}

/**
 * 处理待处理的消耗（应用启动时调用）
 * Process pending consumptions (call on app startup)
 */
async function processPendingConsumptions(): Promise<void> {
  const pending = JSON.parse(localStorage.getItem('pendingConsumptions') || '[]');
  
  for (const purchaseToken of pending) {
    try {
      await consumePurchase(purchaseToken);
      console.log('成功消耗待处理的购买:', purchaseToken);
      
      // 从待处理列表中移除
      const updated = pending.filter((t: string) => t !== purchaseToken);
      localStorage.setItem('pendingConsumptions', JSON.stringify(updated));
    } catch (error) {
      console.error('消耗失败，稍后重试:', purchaseToken, error);
    }
  }
}

// 使用示例
// Usage example
async function main() {
  // 应用启动时处理待处理的消耗
  await processPendingConsumptions();
  
  // 购买商品
  const success = await purchaseConsumableProduct('com.example.coins_100');
  if (success) {
    console.log('购买流程完成！');
  }
}

export {
  purchaseConsumableProduct,
  processPendingConsumptions,
};
