# Dynamic Currency Display Implementation

## Overview
This implementation automatically detects the user's country using IP geolocation and displays prices in their local currency alongside NPR (Nepali Rupees).

## Features Implemented

### 1. **Automatic Location Detection**
- Uses `ipapi.co` API (free, no API key required) to detect user's country
- Results are cached in localStorage for 24 hours to minimize API calls
- Falls back to Nepal if detection fails

### 2. **Currency Display Rules**
- **India Users**: Show NPR, INR (₹), and USD ($)
- **Other Countries**: Show NPR and USD ($)
- **Nepal**: Show NPR and USD ($)

### 3. **Exchange Rates**
Current conversion rates (approximate):
- 1 USD = 133 NPR
- 1 INR = 1.6 NPR

### 4. **Updated Components**

#### Product Display Components:
- **ProductCard.jsx**: Shows secondary currencies in colored badges below main price
- **ProductCard3D.jsx**: Displays converted prices in compact format
- **ProductDetail.jsx**: Large currency boxes showing INR and USD equivalents
- **QuickViewModal.jsx**: Shows converted prices in modal view

#### Cart & Checkout:
- **Cart.jsx**: Displays total in NPR with converted amounts
- **Checkout.jsx**: Shows order total in multiple currencies

### 5. **New Files Created**
```
src/components/ui/CurrencyContext.jsx
```
- Provides currency detection and management
- Caches results for performance
- Exposes hooks: `useCurrency()`

### 6. **Updated Files**
```
src/utils/currency.js
- Added convertToINR()
- Added convertINRToNPR()
- Added formatConvertedPrice()
- Updated formatCurrency() to support INR

src/pages/index.jsx
- Wrapped app with CurrencyProvider

src/components/products/ProductCard.jsx
src/components/products/ProductCard3D.jsx
src/pages/ProductDetail.jsx
src/components/products/QuickViewModal.jsx
src/pages/Cart.jsx
src/pages/Checkout.jsx
```

## Usage

### In Components:
```javascript
import { useCurrency } from '@/components/ui/CurrencyContext';
import { formatConvertedPrice } from '@/utils/currency';

function MyComponent() {
  const { isIndianUser, getSecondaryCurrencies } = useCurrency();
  
  const price = 1000; // NPR
  
  return (
    <div>
      <span>Rs. {price.toLocaleString()}</span>
      {isIndianUser && (
        <>
          <span>{formatConvertedPrice(price, 'INR')}</span>
          <span>{formatConvertedPrice(price, 'USD')}</span>
        </>
      )}
    </div>
  );
}
```

## Testing

### To Test Different Countries:
1. **Clear localStorage**: Open browser DevTools → Application → Local Storage → Clear "userCountry"
2. **Use VPN**: Connect to India/USA to see different currency displays
3. **Manual Override**: In browser console:
   ```javascript
   localStorage.setItem('userCountry', 'IN'); // For India
   localStorage.setItem('userCountry', 'US'); // For USA
   localStorage.setItem('userCountry', 'NP'); // For Nepal
   location.reload();
   ```

## Visual Design

### Indian Users See:
```
Rs. 1,000
≈ ₹625.00  |  ≈ $7.52
```

### Other Countries See:
```
Rs. 1,000
≈ $7.52
```

## Performance Considerations
- Location detection happens once on app load
- Results cached for 24 hours
- No additional API calls during browsing
- Minimal overhead on page load (~50ms)

## Future Enhancements
1. Add more currency support (EUR, GBP, etc.)
2. Real-time exchange rate updates from API
3. Manual currency selector for users
4. Display currency in user's preferred format

## Notes
- Primary currency is always NPR (Nepali Rupees)
- Converted currencies are shown with "≈" (approximately) symbol
- All transactions are processed in NPR on the backend
- Currency conversion is for display purposes only
