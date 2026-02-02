# acknowledgePurchase vs consumePurchase

## 快速决策

```
购买成功后
    ↓
商品类型？
    ↓
    ├─ 消耗型（可重复购买）→ consumePurchase() ✅
    │   例如：游戏币、道具、增益
    │
    └─ 非消耗型/订阅 → acknowledgePurchase() ✅
        例如：去广告、解锁、会员
```

## 详细对比

| 特性 | consumePurchase | acknowledgePurchase |
|-----|----------------|-------------------|
| **用途** | 消耗型商品 | 非消耗型商品 + 订阅 |
| **可重复购买** | ✅ 是 | ❌ 否 |
| **调用后效果** | 商品被"消耗"，可再次购买 | 商品被"确认"，不可再次购买 |
| **Android 必需** | ✅ 是 | ✅ 是 |
| **iOS 必需** | ❌ 否（自动） | ❌ 否（自动） |

## 使用示例

### 消耗型商品（游戏币）

```typescript
// ✅ 正确
const purchase = await purchase('coins_100', 'inapp');
await giveUserCoins(100);
await consumePurchase(purchase.purchaseToken);

// ❌ 错误 - 不要调用 acknowledge
await acknowledgePurchase(purchase.purchaseToken); // 不要这样！
```

### 非消耗型商品（去广告）

```typescript
// ✅ 正确
const purchase = await purchase('remove_ads', 'inapp');
await unlockNoAds();
await acknowledgePurchase(purchase.purchaseToken);

// ❌ 错误 - 不要调用 consume
await consumePurchase(purchase.purchaseToken); // 不要这样！
```

### 订阅商品（会员）

```typescript
// ✅ 正确
const purchase = await purchase('premium_monthly', 'subs');
await activatePremium();
await acknowledgePurchase(purchase.purchaseToken);

// ❌ 错误 - 订阅不能消耗
await consumePurchase(purchase.purchaseToken); // 不要这样！
```

## 常见问题

### Q: 可以同时调用两个函数吗？
**A: 不可以！** 每个购买只能调用其中一个函数。

### Q: 如果调用错了会怎样？
**A:** 
- 消耗型商品调用 `acknowledgePurchase` → 用户无法重复购买
- 非消耗型商品调用 `consumePurchase` → 可能导致购买状态错误

### Q: 如何判断应该用哪个？
**A:** 问自己：用户能重复购买这个商品吗？
- 能 → `consumePurchase`
- 不能 → `acknowledgePurchase`

### Q: 不调用会怎样？
**A:** 在 Android 上，3 天后 Google Play 会自动退款给用户。

## 商品类型示例

### 使用 consumePurchase
- 🪙 游戏币、金币、钻石
- 🎁 礼包、宝箱
- ⚡ 能量、体力
- 🎯 一次性增益道具
- 💊 消耗品

### 使用 acknowledgePurchase
- 🚫 去广告
- 🔓 解锁关卡/功能
- 🎨 永久皮肤/主题
- 👑 会员订阅
- 📅 月度/年度订阅

## Google Play 政策

根据 Google Play 政策：
- **消耗型商品**必须在 3 天内调用 `consumePurchase`
- **非消耗型商品和订阅**必须在 3 天内调用 `acknowledgePurchase`
- 否则 Google Play 会自动退款

## 技术实现（Android）

### consumePurchase
```kotlin
// 内部调用 Google Play Billing 的 consumeAsync
billingClient.consumeAsync(consumeParams) { result, _ ->
    // 购买被消耗，可以再次购买
}
```

### acknowledgePurchase
```kotlin
// 内部调用 Google Play Billing 的 acknowledgePurchase
billingClient.acknowledgePurchase(ackParams) { result ->
    // 购买被确认，不能再次购买
}
```

## 总结

| 如果你的商品是... | 使用... |
|----------------|--------|
| 可以重复购买的 | `consumePurchase` |
| 只能购买一次的 | `acknowledgePurchase` |

**记住**：一个购买只调用一个函数，不要两个都调用！
