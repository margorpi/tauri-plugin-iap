# consumePurchase 快速参考

## 一句话说明
消耗型商品购买后必须调用 `consumePurchase`（Android 必需），否则无法重复购买。
**不要**同时调用 `acknowledgePurchase`。

## 基本用法

```typescript
import { purchase, consumePurchase } from '@choochmeque/tauri-plugin-iap-api';

const p = await purchase('coins_100', 'inapp');
await deliverProduct();
await consumePurchase(p.purchaseToken); // ✅ 只调用这个
```

## 何时使用

| 使用 consumePurchase | 使用 acknowledgePurchase |
|---------------------|-------------------------|
| ✅ 游戏币、金币 | ❌ 去广告 |
| ✅ 消耗性道具 | ❌ 永久解锁 |
| ✅ 一次性增益 | ❌ 订阅服务 |

**重要**：每种商品只调用一个函数，不要两个都调用！

## 平台差异

- **Android**: 必须调用 ⚠️
- **iOS/macOS/Windows**: 可选（自动处理）

## 常见错误

❌ **错误 1**：购买后立即消耗
```typescript
const p = await purchase('coins', 'inapp');
await consumePurchase(p.purchaseToken); // 商品还没发放！
```

❌ **错误 2**：同时调用两个函数
```typescript
await acknowledgePurchase(p.purchaseToken); // ❌ 不要这样
await consumePurchase(p.purchaseToken);     // ❌ 只需要一个
```

✅ **正确**：发放后再消耗
```typescript
const p = await purchase('coins', 'inapp');
await giveUserCoins(100);              // 先发放
await consumePurchase(p.purchaseToken); // 再消耗（只调用这个）
```

## 错误处理

```typescript
try {
  await consumePurchase(token);
} catch (error) {
  // 保存 token，稍后重试
  await saveForRetry(token);
}
```

## 完整文档

详见 [CONSUME_PURCHASE.md](./CONSUME_PURCHASE.md)
