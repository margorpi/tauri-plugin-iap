# consumePurchase 使用说明

## 什么时候使用

对于**消耗型商品**（游戏币、道具等可重复购买的商品），在成功发放商品后调用 `consumePurchase`。

**重要**：消耗型商品只需调用 `consumePurchase`，**不要**调用 `acknowledgePurchase`。

## 为什么需要（Android）

在 Android 上，如果不调用 `consumePurchase`，用户再次购买时会看到"您已经拥有此内容"的提示。

## 使用示例

```typescript
import { purchase, consumePurchase } from 'tauri-plugin-iap';

// 1. 购买消耗型商品
const purchaseResult = await purchase('com.example.coins_100', 'inapp');

// 2. 发放商品给用户
await giveUserCoins(100);

// 3. 消耗购买（Android 必需，其他平台可选）
// 注意：不要调用 acknowledgePurchase
await consumePurchase(purchaseResult.purchaseToken);
```

## 商品类型对比

| 商品类型 | 可重复购买 | 使用函数 | 示例 |
|---------|----------|---------|------|
| 消耗型 (Consumable) | ✅ 是 | `consumePurchase` | 游戏币、道具 |
| 非消耗型 (Non-consumable) | ❌ 否 | `acknowledgePurchase` | 去广告、解锁功能 |
| 订阅 (Subscription) | ❌ 否 | `acknowledgePurchase` | 会员订阅 |

**重要提示**：每种商品类型只调用对应的一个函数，不要同时调用两个。

## 平台差异

- **Android**: 必须调用，使用 Google Play Billing 的 `consumeAsync` API
- **iOS/macOS**: 自动处理，调用此函数是空操作
- **Windows**: 自动处理，调用此函数是空操作
