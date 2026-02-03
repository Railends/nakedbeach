# Rust Item Pricing API Integration

## 🎯 Overview

Real-time Rust item pricing using Steam Market API with intelligent caching.

---

## 📡 API Endpoints

### **Get Single Item Price**
```
GET /api/price/:marketHashName
```

**Example:**
```bash
curl https://nakedbeach.onrender.com/api/price/AK47
```

**Response:**
```json
{
  "item": "AK47",
  "price": 2.50,
  "currency": "USD"
}
```

---

### **Get Multiple Item Prices (Bulk)**
```
POST /api/prices/bulk
```

**Request Body:**
```json
{
  "items": ["AK47", "Metal Chest Plate", "Thompson"]
}
```

**Response:**
```json
{
  "prices": {
    "AK47": 2.50,
    "Metal Chest Plate": 1.20,
    "Thompson": 1.80
  },
  "currency": "USD",
  "cached": {
    "totalEntries": 3,
    "validEntries": 3,
    "expiredEntries": 0,
    "cacheDuration": "10 minutes"
  }
}
```

---

### **Get Cache Statistics**
```
GET /api/prices/cache/stats
```

**Response:**
```json
{
  "totalEntries": 15,
  "validEntries": 12,
  "expiredEntries": 3,
  "cacheDuration": "10 minutes"
}
```

---

### **Clear Price Cache**
```
POST /api/prices/cache/clear
```

**Response:**
```json
{
  "success": true,
  "message": "Price cache cleared"
}
```

---

## 🔧 How It Works

### **Pricing Service** (`backend/services/pricing.js`)

1. **Fetches prices** from Steam Market API
2. **Caches prices** for 10 minutes to avoid rate limits
3. **Handles errors** gracefully (returns $0.00 if price unavailable)
4. **Rate limiting** - adds 1 second delay between bulk requests

### **Cache Strategy**

- **Duration:** 10 minutes
- **Storage:** In-memory (Map)
- **Fallback:** Uses expired cache if API fails
- **Auto-cleanup:** Expired entries are replaced on next fetch

---

## 📊 Usage Examples

### **Frontend Integration**

```javascript
// Get price for a single item
const getItemPrice = async (itemName) => {
  const res = await fetch(`https://nakedbeach.onrender.com/api/price/${encodeURIComponent(itemName)}`);
  const data = await res.json();
  return data.price;
};

// Get prices for inventory
const getPricesForInventory = async (items) => {
  const itemNames = items.map(item => item.market_hash_name || item.name);
  
  const res = await fetch('https://nakedbeach.onrender.com/api/prices/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: itemNames })
  });
  
  const data = await res.json();
  
  // Map prices back to items
  return items.map(item => ({
    ...item,
    price: data.prices[item.market_hash_name || item.name] || 0
  }));
};
```

---

## ⚙️ Configuration

### **Environment Variables** (Optional)

None required! Uses Steam's public Market API.

### **Customization**

Edit `backend/services/pricing.js`:

```javascript
// Change cache duration (default: 10 minutes)
this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Change Rust App ID (shouldn't need to change)
this.RUST_APP_ID = 252490;
```

---

## 🚀 Rate Limits

**Steam Market API:**
- ~20 requests per minute
- Our service adds 1 second delay between bulk requests
- Cache reduces API calls by 90%+

**Best Practices:**
- Use bulk endpoint for multiple items
- Don't clear cache unless necessary
- Prices update every 10 minutes automatically

---

## 🔍 Testing

### **Test Single Price**
```bash
curl https://nakedbeach.onrender.com/api/price/AK47
```

### **Test Bulk Prices**
```bash
curl -X POST https://nakedbeach.onrender.com/api/prices/bulk \
  -H "Content-Type: application/json" \
  -d '{"items": ["AK47", "Thompson", "Metal Chest Plate"]}'
```

### **Check Cache Stats**
```bash
curl https://nakedbeach.onrender.com/api/prices/cache/stats
```

---

## 📈 Future Improvements

1. **Database caching** - Persist prices to SQLite for faster restarts
2. **Multiple price sources** - Aggregate from CSGOFloat, Pricempire
3. **Price history** - Track price changes over time
4. **Admin dashboard** - View pricing stats and cache performance

---

## ✅ What's Included

- ✅ Real-time Steam Market pricing
- ✅ Intelligent caching (10 min)
- ✅ Bulk price fetching
- ✅ Rate limit protection
- ✅ Error handling & fallbacks
- ✅ Cache statistics
- ✅ Manual cache clearing

**Ready to use!** Just deploy to Render and start fetching prices! 🎉
