import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [userCountry, setUserCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currencies, setCurrencies] = useState(['NPR']); // Default: Nepal Rupees only

  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      // Check if location is already cached in localStorage
      const cachedCountry = localStorage.getItem('userCountry');
      const cacheTime = localStorage.getItem('userCountryCacheTime');
      const now = Date.now();

      // Cache for 24 hours (86400000 ms)
      if (cachedCountry && cacheTime && (now - parseInt(cacheTime) < 86400000)) {
        setUserCountry(cachedCountry);
        updateCurrencies(cachedCountry);
        setIsLoading(false);
        return;
      }

      // Use ipapi.co for free IP geolocation (no API key needed)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      if (data && data.country_code) {
        const country = data.country_code.toUpperCase();
        setUserCountry(country);
        updateCurrencies(country);

        // Cache the result
        localStorage.setItem('userCountry', country);
        localStorage.setItem('userCountryCacheTime', now.toString());
      } else {
        // Default to Nepal if detection fails
        setUserCountry('NP');
        updateCurrencies('NP');
      }
    } catch (error) {
      console.error('Failed to detect user location:', error);
      // Default to Nepal on error
      setUserCountry('NP');
      updateCurrencies('NP');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrencies = (country) => {
    if (country === 'IN') {
      // India: Show NPR, INR, and USD
      setCurrencies(['NPR', 'INR', 'USD']);
    } else if (country === 'NP') {
      // Nepal: Show NPR and USD
      setCurrencies(['NPR', 'USD']);
    } else {
      // Other countries: Show NPR and USD
      setCurrencies(['NPR', 'USD']);
    }
  };

  // Get display currencies (excluding NPR which is always primary)
  const getSecondaryCurrencies = () => {
    return currencies.filter(curr => curr !== 'NPR');
  };

  // Check if user is from India
  const isIndianUser = () => {
    return userCountry === 'IN';
  };

  // Check if user is international (not Nepal)
  const isInternationalUser = () => {
    return userCountry && userCountry !== 'NP';
  };

  const value = {
    userCountry,
    currencies,
    isLoading,
    isIndianUser: isIndianUser(),
    isInternationalUser: isInternationalUser(),
    getSecondaryCurrencies,
    detectUserLocation, // Allow manual refresh
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
