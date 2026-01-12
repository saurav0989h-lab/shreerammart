import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Header
    home: 'Home',
    products: 'Products',
    trackOrder: 'Track Order',
    bulkOrders: 'Bulk Orders',
    myAccount: 'My Account',
    contact: 'Contact',
    servingDang: 'Serving Dang, Nepal',
    codAvailable: 'Cash on Delivery Available',
    adminPanel: 'Admin Panel',
    admin: 'Admin',
    localDelivery: 'Local Delivery Service',

    // Hero
    heroTitle: 'Fresh Local Products',
    heroSubtitle: 'Delivered to Your Doorstep',
    heroDescription: 'Quality groceries, dairy, bakery items and more from trusted local vendors in Dang Valley',
    shopNow: 'Shop Now',
    bulkOrderBtn: 'Bulk Orders',

    // Categories
    categories: 'Categories',
    browseCategories: 'Browse Categories',
    viewAll: 'View All',

    // Products
    allProducts: 'All Products',
    searchProducts: 'Search products, categories...',
    allCategories: 'All Categories',
    sortBy: 'Sort by',
    relevance: 'Relevance',
    popular: 'Popular',
    newestFirst: 'Newest First',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    nameAZ: 'Name A-Z',
    inStock: 'In Stock',
    onSale: 'On Sale',
    filters: 'Filters',
    clearAll: 'Clear all',
    activeFilters: 'Active filters:',
    productsFound: 'products found',
    noProductsFound: 'No products found',
    tryAdjusting: 'Try adjusting your search or filters',
    clearFilters: 'Clear Filters',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    perKg: 'per kg',
    perItem: 'per item',

    // Cart
    cart: 'Cart',
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    startShopping: 'Start Shopping',
    continueShopping: 'Continue Shopping',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    freeDelivery: 'Free Delivery',
    freeDeliveryOver: 'Free delivery on orders over',
    grandTotal: 'Grand Total',
    proceedToCheckout: 'Proceed to Checkout',

    // Checkout
    checkout: 'Checkout',
    deliveryDetails: 'Delivery Details',
    customerInfo: 'Customer Information',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    email: 'Email',
    deliveryMethod: 'Delivery Method',
    homeDelivery: 'Home Delivery',
    pickupFromStore: 'Pickup from Store',
    deliveryAddress: 'Delivery Address',
    municipality: 'Municipality',
    wardNo: 'Ward No.',
    area: 'Area/Tole',
    landmark: 'Landmark',
    deliveryDate: 'Delivery Date',
    timeSlot: 'Time Slot',
    morning: 'Morning (8 AM - 12 PM)',
    afternoon: 'Afternoon (12 PM - 4 PM)',
    evening: 'Evening (4 PM - 7 PM)',
    paymentMethod: 'Payment Method',
    placeOrder: 'Place Order',
    processing: 'Processing...',

    // Order Tracking
    orderTracking: 'Order Tracking',
    trackYourOrder: 'Track Your Order',
    enterOrderNumber: 'Enter your order number',
    track: 'Track',
    orderStatus: 'Order Status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    outForDelivery: 'Out for Delivery',
    completed: 'Completed',
    cancelled: 'Cancelled',

    // Profile
    profile: 'Profile',
    personalInfo: 'Personal Information',
    savedAddresses: 'Saved Addresses',
    orderHistory: 'Order History',
    rewards: 'Rewards',
    loyaltyPoints: 'Loyalty Points',
    availablePoints: 'Available Points',
    totalOrders: 'Total Orders',
    totalSpent: 'Total Spent',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    addAddress: 'Add Address',
    setDefault: 'Set Default',
    delete: 'Delete',

    // Footer
    aboutUs: 'About Us',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    delivery: 'Delivery',
    sameDayDelivery: 'Same Day Delivery',
    allOfDangValley: 'All of Dang Valley',
    ourStoreLocations: 'Our Store Locations',
    getDirections: 'Get Directions',
    allRightsReserved: 'All rights reserved',
    madeWithLove: 'Designed and developed by Saurav Bhandari',

    // Why Choose Us
    whyChooseUs: 'Why Choose Us',
    freshProducts: 'Fresh Products',
    freshProductsDesc: 'All products sourced fresh from local farms and vendors',
    fastDelivery: 'Fast Delivery',
    fastDeliveryDesc: 'Same day delivery across Dang Valley',
    localSupport: 'Local Support',
    localSupportDesc: 'Supporting local farmers and businesses',
    easyPayment: 'Easy Payment',
    easyPaymentDesc: 'Cash on delivery and online payment options',

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    submit: 'Submit',
    required: 'Required',
    optional: 'Optional',
    yes: 'Yes',
    no: 'No',
    rs: 'Rs.',
    // Extra keys used across UI
    reviews: 'reviews',
    customAmount: 'Custom Amount',
    enterAmount: 'Enter amount',
    liter: 'Liter',
    halfLiter: 'Half Liter',
    gram: 'Gram',
    customerReviews: 'Customer Reviews',
    basedOn: 'Based on',
    writeReview: 'Write Review',
    shoppingLists: 'Shopping Lists',
    login: 'Login',
    signup: 'Sign Up',
    deals: 'Deals',
    myLists: 'My Lists',
  },
  np: {
    // Header
    home: 'गृहपृष्ठ',
    products: 'उत्पादनहरू',
    trackOrder: 'अर्डर ट्र्याक',
    bulkOrders: 'थोक अर्डर',
    myAccount: 'मेरो खाता',
    contact: 'सम्पर्क',
    servingDang: 'दाङमा सेवा प्रदान गर्दै',
    codAvailable: 'क्यास अन डेलिभरी उपलब्ध',
    adminPanel: 'एडमिन प्यानल',
    admin: 'एडमिन',
    localDelivery: 'स्थानीय डेलिभरी सेवा',

    // Hero
    heroTitle: 'ताजा स्थानीय उत्पादनहरू',
    heroSubtitle: 'तपाईंको घरमा डेलिभरी',
    heroDescription: 'दाङ उपत्यकाका विश्वसनीय स्थानीय विक्रेताहरूबाट गुणस्तरीय किराना, डेरी, बेकरी सामान र धेरै',
    shopNow: 'अहिले किन्नुहोस्',
    bulkOrderBtn: 'थोक अर्डर',

    // Categories
    categories: 'श्रेणीहरू',
    browseCategories: 'श्रेणीहरू हेर्नुहोस्',
    viewAll: 'सबै हेर्नुहोस्',

    // Products
    allProducts: 'सबै उत्पादनहरू',
    searchProducts: 'उत्पादनहरू खोज्नुहोस्...',
    allCategories: 'सबै श्रेणीहरू',
    sortBy: 'क्रमबद्ध गर्नुहोस्',
    relevance: 'सान्दर्भिकता',
    popular: 'लोकप्रिय',
    newestFirst: 'नयाँ पहिले',
    priceLowHigh: 'मूल्य: कम देखि उच्च',
    priceHighLow: 'मूल्य: उच्च देखि कम',
    nameAZ: 'नाम अ-ज्ञ',
    inStock: 'स्टकमा',
    onSale: 'छुटमा',
    filters: 'फिल्टरहरू',
    clearAll: 'सबै हटाउनुहोस्',
    activeFilters: 'सक्रिय फिल्टरहरू:',
    productsFound: 'उत्पादनहरू भेटियो',
    noProductsFound: 'उत्पादनहरू भेटिएन',
    tryAdjusting: 'तपाईंको खोज वा फिल्टरहरू समायोजन गर्नुहोस्',
    clearFilters: 'फिल्टरहरू हटाउनुहोस्',
    addToCart: 'कार्टमा थप्नुहोस्',
    outOfStock: 'स्टक सकियो',
    perKg: 'प्रति केजी',
    perItem: 'प्रति थान',

    // Cart
    cart: 'कार्ट',
    yourCart: 'तपाईंको कार्ट',
    cartEmpty: 'तपाईंको कार्ट खाली छ',
    startShopping: 'किनमेल सुरु गर्नुहोस्',
    continueShopping: 'किनमेल जारी राख्नुहोस्',
    orderSummary: 'अर्डर सारांश',
    subtotal: 'उप-जम्मा',
    deliveryFee: 'डेलिभरी शुल्क',
    freeDelivery: 'निःशुल्क डेलिभरी',
    freeDeliveryOver: 'माथिको अर्डरमा निःशुल्क डेलिभरी',
    grandTotal: 'कुल जम्मा',
    proceedToCheckout: 'चेकआउटमा जानुहोस्',

    // Checkout
    checkout: 'चेकआउट',
    deliveryDetails: 'डेलिभरी विवरण',
    customerInfo: 'ग्राहक जानकारी',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नम्बर',
    email: 'इमेल',
    deliveryMethod: 'डेलिभरी विधि',
    homeDelivery: 'घर डेलिभरी',
    pickupFromStore: 'पसलबाट लिनुहोस्',
    deliveryAddress: 'डेलिभरी ठेगाना',
    municipality: 'नगरपालिका',
    wardNo: 'वडा नं.',
    area: 'क्षेत्र/टोल',
    landmark: 'ल्यान्डमार्क',
    deliveryDate: 'डेलिभरी मिति',
    timeSlot: 'समय',
    morning: 'बिहान (८ - १२ बजे)',
    afternoon: 'दिउँसो (१२ - ४ बजे)',
    evening: 'साँझ (४ - ७ बजे)',
    paymentMethod: 'भुक्तानी विधि',
    placeOrder: 'अर्डर गर्नुहोस्',
    processing: 'प्रक्रियामा...',

    // Order Tracking
    orderTracking: 'अर्डर ट्र्याकिङ',
    trackYourOrder: 'तपाईंको अर्डर ट्र्याक गर्नुहोस्',
    enterOrderNumber: 'तपाईंको अर्डर नम्बर प्रविष्ट गर्नुहोस्',
    track: 'ट्र्याक',
    orderStatus: 'अर्डर स्थिति',
    pending: 'पेन्डिङ',
    confirmed: 'पुष्टि भयो',
    preparing: 'तयारी हुँदैछ',
    outForDelivery: 'डेलिभरीमा',
    completed: 'पूरा भयो',
    cancelled: 'रद्द भयो',

    // Profile
    profile: 'प्रोफाइल',
    personalInfo: 'व्यक्तिगत जानकारी',
    savedAddresses: 'सुरक्षित ठेगानाहरू',
    orderHistory: 'अर्डर इतिहास',
    rewards: 'पुरस्कारहरू',
    loyaltyPoints: 'लोयल्टी पोइन्ट्स',
    availablePoints: 'उपलब्ध पोइन्ट्स',
    totalOrders: 'कुल अर्डरहरू',
    totalSpent: 'कुल खर्च',
    edit: 'सम्पादन',
    save: 'सेभ गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    addAddress: 'ठेगाना थप्नुहोस्',
    setDefault: 'डिफल्ट बनाउनुहोस्',
    delete: 'मेट्नुहोस्',

    // Footer
    aboutUs: 'हाम्रो बारेमा',
    quickLinks: 'द्रुत लिङ्कहरू',
    contactUs: 'सम्पर्क गर्नुहोस्',
    delivery: 'डेलिभरी',
    sameDayDelivery: 'उही दिन डेलिभरी',
    allOfDangValley: 'सम्पूर्ण दाङ उपत्यका',
    ourStoreLocations: 'हाम्रा पसलहरूको स्थान',
    getDirections: 'दिशा प्राप्त गर्नुहोस्',
    allRightsReserved: 'सर्वाधिकार सुरक्षित',
    madeWithLove: 'सौरभ भण्डारीद्वारा डिजाइन र विकास गरिएको',

    // Why Choose Us
    whyChooseUs: 'हामीलाई किन छान्ने',
    freshProducts: 'ताजा उत्पादनहरू',
    freshProductsDesc: 'सबै उत्पादनहरू स्थानीय फार्म र विक्रेताहरूबाट ताजा ल्याइएको',
    fastDelivery: 'छिटो डेलिभरी',
    fastDeliveryDesc: 'दाङ उपत्यकाभर उही दिन डेलिभरी',
    localSupport: 'स्थानीय समर्थन',
    localSupportDesc: 'स्थानीय किसान र व्यवसायहरूलाई समर्थन',
    easyPayment: 'सजिलो भुक्तानी',
    easyPaymentDesc: 'क्यास अन डेलिभरी र अनलाइन भुक्तानी विकल्पहरू',

    // Common
    loading: 'लोड हुँदैछ...',
    error: 'त्रुटि',
    success: 'सफल',
    close: 'बन्द गर्नुहोस्',
    submit: 'पेश गर्नुहोस्',
    required: 'आवश्यक',
    optional: 'वैकल्पिक',
    yes: 'हो',
    no: 'होइन',
    rs: 'रु.',
    // Extra keys used across UI
    reviews: 'समीक्षा',
    customAmount: 'मात्रा',
    enterAmount: 'मात्रा प्रविष्ट गर्नुहोस्',
    liter: 'लिटर',
    halfLiter: 'आधा लिटर',
    gram: 'ग्राम',
    customerReviews: 'ग्राहक समीक्षा',
    basedOn: 'आधारित',
    writeReview: 'समीक्षा लेख्नुहोस्',
    shoppingLists: 'किनमेल सूचीहरू',
    login: 'लग-इन',
    signup: 'साइन अप',
    deals: 'डिल्स',
    myLists: 'मेरो सूचीहरू',
  },
  hi: {
    // Header
    home: 'होम',
    products: 'उत्पाद',
    trackOrder: 'ऑर्डर ट्रैक करें',
    bulkOrders: 'थोक ऑर्डर',
    myAccount: 'मेरा खाता',
    contact: 'संपर्क',
    servingDang: 'दांग, नेपाल में सेवा',
    codAvailable: 'डिलीवरी पर नकद उपलब्ध',
    adminPanel: 'एडमिन पैनल',
    admin: 'एडमिन',
    localDelivery: 'स्थानीय डिलीवरी सेवा',

    // Hero
    heroTitle: 'ताज़ा स्थानीय उत्पाद',
    heroSubtitle: 'आपके दरवाज़े पर डिलीवरी',
    heroDescription: 'दांग वैली के विश्वसनीय स्थानीय विक्रेताओं से गुणवत्ता किराना, डेयरी, बेकरी और अधिक',
    shopNow: 'अभी खरीदें',
    bulkOrderBtn: 'थोक ऑर्डर',

    // Categories
    categories: 'श्रेणियाँ',
    browseCategories: 'श्रेणियाँ देखें',
    viewAll: 'सभी देखें',

    // Products
    allProducts: 'सभी उत्पाद',
    searchProducts: 'उत्पाद/श्रेणियाँ खोजें...',
    allCategories: 'सभी श्रेणियाँ',
    sortBy: 'सॉर्ट करें',
    relevance: 'प्रासंगिकता',
    popular: 'लोकप्रिय',
    newestFirst: 'नए पहले',
    priceLowHigh: 'कीमत: कम से अधिक',
    priceHighLow: 'कीमत: अधिक से कम',
    nameAZ: 'नाम A-Z',
    inStock: 'स्टॉक में',
    onSale: 'छूट पर',
    filters: 'फ़िल्टर',
    clearAll: 'सभी साफ़ करें',
    activeFilters: 'सक्रिय फ़िल्टर:',
    productsFound: 'उत्पाद मिले',
    noProductsFound: 'कोई उत्पाद नहीं मिला',
    tryAdjusting: 'अपनी खोज या फ़िल्टर समायोजित करें',
    clearFilters: 'फ़िल्टर साफ़ करें',
    addToCart: 'कार्ट में जोड़ें',
    outOfStock: 'स्टॉक समाप्त',
    perKg: 'प्रति किलो',
    perItem: 'प्रति पीस',

    // Cart
    cart: 'कार्ट',
    yourCart: 'आपका कार्ट',
    cartEmpty: 'आपका कार्ट खाली है',
    startShopping: 'खरीदारी शुरू करें',
    continueShopping: 'खरीदारी जारी रखें',
    orderSummary: 'ऑर्डर सारांश',
    subtotal: 'उप-योग',
    deliveryFee: 'डिलीवरी शुल्क',
    freeDelivery: 'मुफ़्त डिलीवरी',
    freeDeliveryOver: 'इससे ऊपर मुफ़्त डिलीवरी',
    grandTotal: 'कुल योग',
    proceedToCheckout: 'चेकआउट पर जाएँ',

    // Checkout
    checkout: 'चेकआउट',
    deliveryDetails: 'डिलीवरी विवरण',
    customerInfo: 'ग्राहक जानकारी',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    email: 'ईमेल',
    deliveryMethod: 'डिलीवरी विधि',
    homeDelivery: 'घर पर डिलीवरी',
    pickupFromStore: 'स्टोर से लें',
    deliveryAddress: 'डिलीवरी पता',
    municipality: 'नगरपालिका',
    wardNo: 'वार्ड नंबर',
    area: 'क्षेत्र/टोले',
    landmark: 'लैंडमार्क',
    deliveryDate: 'डिलीवरी तिथि',
    timeSlot: 'समय स्लॉट',
    morning: 'सुबह (8 AM - 12 PM)',
    afternoon: 'दोपहर (12 PM - 4 PM)',
    evening: 'शाम (4 PM - 7 PM)',
    paymentMethod: 'भुगतान विधि',
    placeOrder: 'ऑर्डर करें',
    processing: 'प्रोसेसिंग...',

    // Order Tracking
    orderTracking: 'ऑर्डर ट्रैकिंग',
    trackYourOrder: 'अपना ऑर्डर ट्रैक करें',
    enterOrderNumber: 'अपना ऑर्डर नंबर दर्ज करें',
    track: 'ट्रैक',
    orderStatus: 'ऑर्डर स्थिति',
    pending: 'लंबित',
    confirmed: 'पुष्ट',
    preparing: 'तैयारी में',
    outForDelivery: 'डिलीवरी के लिए निकला',
    completed: 'पूर्ण',
    cancelled: 'रद्द',

    // Profile
    profile: 'प्रोफ़ाइल',
    personalInfo: 'व्यक्तिगत जानकारी',
    savedAddresses: 'सहेजे गए पते',
    orderHistory: 'ऑर्डर इतिहास',
    rewards: 'रिवॉर्ड्स',
    loyaltyPoints: 'लोयल्टी पॉइंट्स',
    availablePoints: 'उपलब्ध पॉइंट्स',
    totalOrders: 'कुल ऑर्डर',
    totalSpent: 'कुल खर्च',
    edit: 'संपादित करें',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    addAddress: 'पता जोड़ें',
    setDefault: 'डिफ़ॉल्ट सेट करें',
    delete: 'हटाएँ',

    // Footer
    aboutUs: 'हमारे बारे में',
    quickLinks: 'त्वरित लिंक',
    contactUs: 'संपर्क करें',
    delivery: 'डिलीवरी',
    sameDayDelivery: 'उसी दिन डिलीवरी',
    allOfDangValley: 'पूरे दांग वैली में',
    ourStoreLocations: 'हमारे स्टोर स्थान',
    getDirections: 'दिशा प्राप्त करें',
    allRightsReserved: 'सर्वाधिकार सुरक्षित',
    madeWithLove: 'डिज़ाइन और डेवलप: सौरव भंडारी',

    // Why Choose Us
    whyChooseUs: 'हमें क्यों चुनें',
    freshProducts: 'ताज़ा उत्पाद',
    freshProductsDesc: 'सभी उत्पाद स्थानीय किसानों और विक्रेताओं से ताज़ा',
    fastDelivery: 'तेज़ डिलीवरी',
    fastDeliveryDesc: 'दांग वैली में उसी दिन डिलीवरी',
    localSupport: 'स्थानीय समर्थन',
    localSupportDesc: 'स्थानीय किसानों और व्यवसायों को समर्थन',
    easyPayment: 'आसान भुगतान',
    easyPaymentDesc: 'कैश ऑन डिलीवरी और ऑनलाइन भुगतान',

    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफल',
    close: 'बंद करें',
    submit: 'सबमिट करें',
    required: 'आवश्यक',
    optional: 'वैकल्पिक',
    yes: 'हाँ',
    no: 'नहीं',
    rs: 'Rs.',

    // Extra keys used across UI
    reviews: 'समीक्षाएँ',
    customAmount: 'कस्टम मात्रा',
    enterAmount: 'मात्रा दर्ज करें',
    liter: 'लीटर',
    halfLiter: 'आधा लीटर',
    gram: 'ग्राम',
    customerReviews: 'ग्राहक समीक्षाएँ',
    basedOn: 'के आधार पर',
    writeReview: 'समीक्षा लिखें',
    shoppingLists: 'खरीद सूची',
    login: 'लॉगिन',
    signup: 'साइन अप',
    deals: 'डील्स',
    myLists: 'मेरी सूचियाँ',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'np' : (prev === 'np' ? 'hi' : 'en')));
  };

  console.log('LanguageProvider State:', { language, hasT: !!t });

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}