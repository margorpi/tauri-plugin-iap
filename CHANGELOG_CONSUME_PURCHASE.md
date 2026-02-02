# 新增功能：consumePurchase

## 概述

添加了 `consumePurchase` 函数，用于支持消耗型商品（consumable products）的重复购买。

## 新增 API

### TypeScript/JavaScript

```typescript
import { consumePurchase } from '@choochmeque/tauri-plugin-iap-api';

// 消耗购买，允许重复购买
const result = await consumePurchase(purchaseToken);
// result: { success: boolean }
```

### 接口定义

```typescript
interface ConsumePurchaseResponse {
  success: boolean;
}

function consumePurchase(purchaseToken: string): Promise<ConsumePurchaseResponse>;
```

## 使用场景

适用于可重复购买的商品：
- 游戏币、金币
- 消耗性道具
- 一次性增益物品

**不适用于**：
- 永久解锁功能（使用 `acknowledgePurchase`）
- 订阅服务（使用 `acknowledgePurchase`）

## 平台行为

| 平台 | 行为 | 说明 |
|-----|------|------|
| Android | 必需 | 调用 Google Play Billing 的 `consumeAsync` API |
| iOS | 空操作 | StoreKit 2 自动处理 |
| macOS | 空操作 | StoreKit 2 自动处理 |
| Windows | 空操作 | Windows Store 自动处理 |

## 完整示例

```typescript
import { purchase, consumePurchase, PurchaseState } from '@choochmeque/tauri-plugin-iap-api';

async function buyCoins() {
  // 1. 购买
  const purchaseResult = await purchase('com.example.coins_100', 'inapp');
  
  if (purchaseResult.purchaseState === PurchaseState.PURCHASED) {
    // 2. 发放商品
    await giveUserCoins(100);
    
    // 3. 消耗购买（Android 必需）
    await consumePurchase(purchaseResult.purchaseToken);
  }
}
```

## 文档

- [CONSUME_PURCHASE.md](./CONSUME_PURCHASE.md) - 使用说明
- [examples/consumable-purchase-example.ts](./examples/consumable-purchase-example.ts) - 完整示例

## 技术实现

### Android (Kotlin)
```kotlin
val consumeParams = ConsumeParams.newBuilder()
    .setPurchaseToken(purchaseToken)
    .build()

billingClient.consumeAsync(consumeParams) { billingResult, _ ->
    // 处理结果
}
```

### 其他平台
返回 `{ success: true }` 的空操作实现，保持 API 一致性。

## 权限

已自动添加到默认权限集：
```toml
permissions = ["allow-consume-purchase"]
```

## 测试

已添加 Android 单元测试：
- `testConsumePurchaseArgs_withNullToken`
- `testConsumePurchaseArgs_withValidToken`
- `testConsumePurchaseArgs_withLongToken`
