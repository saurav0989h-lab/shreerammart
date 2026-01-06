
// Local Mock Client for Base44
// Replaces the external SDK with local storage persistence

const HELPER_KEYS = {
  USER: 'base44_mock_user',
  AUTH: 'base44_mock_auth_token',
};

const MOCK_USER = {
  id: 'user_local_admin',
  email: 'admin@local.com',
  first_name: 'Local',
  last_name: 'Admin',
  phone: '9800000000',
  role: 'admin'
};

// Generic Entity Manager
const createEntityManager = (entityName) => {
  const getStorageKey = () => `base44_entity_${entityName}`;

  const getAll = () => {
    try {
      const data = localStorage.getItem(getStorageKey());
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${entityName} from storage`, error);
      return [];
    }
  };

  const saveAll = (items) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(items));
  };

  return {
    list: async (sortString) => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 100));
      let items = getAll();
      // Simple sort handling (descending if starts with -)
      if (sortString && sortString.startsWith('-')) {
        const key = sortString.substring(1);
        items.sort((a, b) => (b[key] > a[key] ? 1 : -1));
      } else if (sortString) {
        items.sort((a, b) => (a[sortString] > b[sortString] ? 1 : -1));
      }
      return items;
    },

    filter: async (criteria) => {
      await new Promise(r => setTimeout(r, 100));
      let items = getAll();
      items = items.filter(item => {
        for (const key in criteria) {
          if (item[key] !== criteria[key]) return false;
        }
        return true;
      });
      return items;
    },

    create: async (data) => {
      await new Promise(r => setTimeout(r, 200));
      const items = getAll();
      const newItem = {
        id: `${entityName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        created_date: new Date().toISOString(),
        ...data
      };
      items.push(newItem);
      saveAll(items);
      return newItem;
    },

    update: async (id, data) => {
      await new Promise(r => setTimeout(r, 200));
      const items = getAll();
      const index = items.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`${entityName} not found`);

      const updatedItem = { ...items[index], ...data };
      items[index] = updatedItem;
      saveAll(items);
      return updatedItem;
    },

    delete: async (id) => {
      await new Promise(r => setTimeout(r, 200));
      const items = getAll();
      const filtered = items.filter(item => item.id !== id);
      saveAll(filtered);
      return { success: true };
    }
  };
};

// Internal user manager
const userManager = createEntityManager('users');

const auth = {
  signup: async (userData) => {
    await new Promise(r => setTimeout(r, 500));

    // Check if user exists
    const users = await userManager.list();
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    // Default mock admin check (optional, but good for consistency)
    if (userData.email === MOCK_USER.email) {
      throw new Error('This email is reserved');
    }

    const newUser = await userManager.create({
      ...userData,
      role: 'user', // Default role
      password: userData.password // In a real app, NEVER store plaintext passwords
    });

    // Auto login
    return auth.login(userData.email, userData.password);
  },

  login: async (email, password) => {
    await new Promise(r => setTimeout(r, 500));

    // Check special admin first
    if (email === MOCK_USER.email && password === 'admin123') { // Simple hardcoded admin
      localStorage.setItem(HELPER_KEYS.AUTH, 'mock_admin_token');
      localStorage.setItem(HELPER_KEYS.USER, JSON.stringify(MOCK_USER));
      return { user: MOCK_USER, token: 'mock_admin_token' };
    }

    // Check registered users
    const users = await userManager.list();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = `mock_token_${user.id}`;
    localStorage.setItem(HELPER_KEYS.AUTH, token);
    localStorage.setItem(HELPER_KEYS.USER, JSON.stringify(user));
    return { user, token };
  },

  logout: async () => {
    localStorage.removeItem(HELPER_KEYS.AUTH);
    localStorage.removeItem(HELPER_KEYS.USER);
    window.location.href = '/Login';
  },

  me: async () => {
    const savedUser = localStorage.getItem(HELPER_KEYS.USER);
    return savedUser ? JSON.parse(savedUser) : null;
  },

  isAuthenticated: async () => {
    return !!localStorage.getItem(HELPER_KEYS.AUTH);
  },

  updateMe: async (data) => {
    const currentUser = await auth.me();
    if (!currentUser) throw new Error('Not authenticated');

    const updated = { ...currentUser, ...data };

    // Update in storage
    localStorage.setItem(HELPER_KEYS.USER, JSON.stringify(updated));

    // Update in DB if it's a real user (not the hardcoded admin)
    if (currentUser.id !== MOCK_USER.id) {
      await userManager.update(currentUser.id, data);
    }

    return updated;
  },

  redirectToLogin: (url) => {
    window.location.href = url || '/Login';
  },

  // --- Advanced Auth Mocks ---

  loginWithGoogle: async () => {
    await new Promise(r => setTimeout(r, 800)); // Simulate popup delay

    const googleUser = {
      id: `google_${Date.now()}`,
      email: `google_user_${Date.now()}@gmail.com`,
      first_name: 'Google',
      last_name: 'User',
      role: 'user',
      auth_provider: 'google'
    };

    // Check if user exists, if not create
    const users = await userManager.list();
    let user = users.find(u => u.email === googleUser.email);

    if (!user) {
      user = await userManager.create(googleUser);
    }

    const token = `mock_google_token_${user.id}`;
    localStorage.setItem(HELPER_KEYS.AUTH, token);
    localStorage.setItem(HELPER_KEYS.USER, JSON.stringify(user));
    return { user, token };
  },

  requestPhoneOtp: async (phoneNumber) => {
    await new Promise(r => setTimeout(r, 600));
    // In a real app, this sends an SMS. Here we just accept format.
    if (!phoneNumber || phoneNumber.length < 10) {
      throw new Error('Invalid phone number');
    }
    console.log(`[Mock] OTP for ${phoneNumber} is 123456`);
    return { success: true, message: 'OTP sent to your phone' };
  },

  verifyPhoneOtp: async (phoneNumber, otp) => {
    await new Promise(r => setTimeout(r, 600));

    if (otp !== '123456') { // Mock OTP
      throw new Error('Invalid OTP');
    }

    const phoneUser = {
      id: `phone_${phoneNumber}`,
      email: `${phoneNumber}@phone.local`, // Mock email for phone users
      first_name: 'Phone',
      last_name: 'User',
      phone: phoneNumber,
      role: 'user',
      auth_provider: 'phone'
    };

    // Check/Create
    const users = await userManager.list();
    let user = users.find(u => u.phone === phoneNumber);

    if (!user) {
      user = await userManager.create(phoneUser);
    }

    const token = `mock_phone_token_${user.id}`;
    localStorage.setItem(HELPER_KEYS.AUTH, token);
    localStorage.setItem(HELPER_KEYS.USER, JSON.stringify(user));
    return { user, token };
  }
};

// Mock Integrations
const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      // Convert file to base64 data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({ file_url: reader.result });
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    },
    InvokeLLM: async ({ prompt }) => {
      return { answer: "This is a mock response from the local AI assistant.", content: "Mock AI content generated locally." };
    },
    GenerateImage: async ({ prompt }) => {
      return { url: "https://via.placeholder.com/600x400?text=AI+Generated+Image" };
    }
  }
};

// Proxy to handle dynamic entity names (base44.entities.User, base44.entities.Product, etc.)
const entitiesHandler = {
  get: (target, prop) => {
    if (typeof prop !== 'string' || prop === 'then' || prop === 'toJSON') return target[prop];
    if (!target[prop]) {
      target[prop] = createEntityManager(prop);
    }
    return target[prop];
  }
};

const entities = new Proxy({}, entitiesHandler);

// Initialize sample data if storage is empty
const initializeSampleData = () => {
  const categoryKey = 'base44_entity_Category';
  const productKey = 'base44_entity_Product';
  const bannerKey = 'base44_entity_PromotionBanner';
  const galleryKey = 'base44_entity_GalleryImage';
  
  // Check if already initialized
  if (localStorage.getItem(categoryKey) && localStorage.getItem(productKey)) {
    return;
  }

  // Sample Categories
  const categories = [
    {
      id: 'cat_1',
      name: 'Fresh Vegetables',
      description: 'Farm-fresh vegetables from local farms',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      display_order: 1,
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'cat_2',
      name: 'Fresh Fruits',
      description: 'Seasonal fruits picked at peak ripeness',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400',
      display_order: 2,
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'cat_3',
      name: 'Dairy Products',
      description: 'Fresh dairy products from local farms',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      display_order: 3,
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'cat_4',
      name: 'Grains & Pulses',
      description: 'Quality grains and pulses',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      display_order: 4,
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'cat_5',
      name: 'Spices & Herbs',
      description: 'Fresh and dried herbs and spices',
      image: 'https://images.unsplash.com/photo-1596040033229-a0b3b35b4c69?w=400',
      display_order: 5,
      is_active: true,
      created_date: new Date().toISOString()
    }
  ];

  // Sample Products
  const products = [
    {
      id: 'prod_1',
      name: 'Fresh Tomatoes',
      description: 'Locally grown organic tomatoes, fresh from the farm. Rich in vitamins and perfect for salads, cooking, or making sauces.',
      category_id: 'cat_1',
      category_name: 'Fresh Vegetables',
      images: ['https://images.unsplash.com/photo-1546470427-227b2e4c19de?w=400', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 120,
      discount_price: 100,
      stock_quantity: 500,
      min_order_qty: 0.5,
      is_bulk_only: false,
      is_visible: true,
      is_featured: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_2',
      name: 'Fresh Potatoes',
      description: 'High-quality potatoes sourced from local farms. Perfect for frying, boiling, or baking. Rich in nutrients and naturally grown.',
      category_id: 'cat_1',
      category_name: 'Fresh Vegetables',
      images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 60,
      discount_price: 50,
      stock_quantity: 1000,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_3',
      name: 'Green Cabbage',
      description: 'Fresh and crispy cabbage, ideal for salads, stir-fries, and traditional dishes. Packed with fiber and vitamins.',
      category_id: 'cat_1',
      category_name: 'Fresh Vegetables',
      images: ['https://images.unsplash.com/photo-1594282554516-d10b48895d4e?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 80,
      discount_price: 70,
      stock_quantity: 300,
      min_order_qty: 0.5,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_4',
      name: 'Fresh Carrots',
      description: 'Sweet and crunchy carrots, perfect for snacking, cooking, or juicing. Rich in beta-carotene and essential nutrients.',
      category_id: 'cat_1',
      category_name: 'Fresh Vegetables',
      images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 90,
      discount_price: 80,
      stock_quantity: 400,
      min_order_qty: 0.5,
      is_bulk_only: false,
      is_visible: true,
      is_featured: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_5',
      name: 'Fresh Apples',
      description: 'Crisp and juicy apples, sourced from mountain orchards. Perfect for snacking or baking. Rich in fiber and antioxidants.',
      category_id: 'cat_2',
      category_name: 'Fresh Fruits',
      images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 250,
      discount_price: 220,
      stock_quantity: 200,
      min_order_qty: 0.5,
      is_bulk_only: false,
      is_visible: true,
      is_featured: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_6',
      name: 'Bananas',
      description: 'Fresh yellow bananas, naturally ripened. Great source of potassium and energy. Perfect for breakfast or smoothies.',
      category_id: 'cat_2',
      category_name: 'Fresh Fruits',
      images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'],
      unit_type: 'dozen',
      sell_by: 'item',
      base_price: 150,
      discount_price: 130,
      stock_quantity: 100,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_7',
      name: 'Fresh Oranges',
      description: 'Sweet and tangy oranges, bursting with vitamin C. Perfect for fresh juice or eating as a healthy snack.',
      category_id: 'cat_2',
      category_name: 'Fresh Fruits',
      images: ['https://images.unsplash.com/photo-1547514701-42782101795e?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 180,
      discount_price: 160,
      stock_quantity: 250,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_8',
      name: 'Fresh Milk',
      description: 'Pure and fresh milk from local dairy farms. Pasteurized for safety while retaining natural goodness.',
      category_id: 'cat_3',
      category_name: 'Dairy Products',
      images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'],
      unit_type: 'liter',
      sell_by: 'item',
      base_price: 80,
      discount_price: 75,
      stock_quantity: 150,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_9',
      name: 'Paneer (Cottage Cheese)',
      description: 'Fresh homemade paneer, rich in protein. Perfect for curries, grilling, or adding to salads.',
      category_id: 'cat_3',
      category_name: 'Dairy Products',
      images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400'],
      unit_type: 'gram',
      sell_by: 'weight',
      base_price: 400,
      discount_price: 380,
      stock_quantity: 50,
      min_order_qty: 250,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_10',
      name: 'Fresh Yogurt (Dahi)',
      description: 'Creamy and tangy yogurt made from fresh milk. Great for digestion and perfect with meals or as a snack.',
      category_id: 'cat_3',
      category_name: 'Dairy Products',
      images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'],
      unit_type: 'liter',
      sell_by: 'item',
      base_price: 100,
      discount_price: 90,
      stock_quantity: 80,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_11',
      name: 'Basmati Rice',
      description: 'Premium long-grain basmati rice with aromatic fragrance. Perfect for biryanis, pulao, and everyday meals.',
      category_id: 'cat_4',
      category_name: 'Grains & Pulses',
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 150,
      discount_price: 140,
      stock_quantity: 500,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_12',
      name: 'Red Lentils (Masoor Dal)',
      description: 'High-quality red lentils, rich in protein and fiber. Cooks quickly and perfect for soups and traditional dal.',
      category_id: 'cat_4',
      category_name: 'Grains & Pulses',
      images: ['https://images.unsplash.com/photo-1574484284002-952d92456975?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 180,
      discount_price: 170,
      stock_quantity: 300,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_13',
      name: 'Chickpeas (Chana)',
      description: 'Premium quality chickpeas, perfect for curries, salads, or making hummus. Excellent source of plant protein.',
      category_id: 'cat_4',
      category_name: 'Grains & Pulses',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'],
      unit_type: 'kg',
      sell_by: 'weight',
      base_price: 160,
      discount_price: 150,
      stock_quantity: 400,
      min_order_qty: 1,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_14',
      name: 'Turmeric Powder',
      description: 'Pure ground turmeric with natural color and aroma. Essential spice for cooking with anti-inflammatory properties.',
      category_id: 'cat_5',
      category_name: 'Spices & Herbs',
      images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400'],
      unit_type: 'gram',
      sell_by: 'weight',
      base_price: 300,
      discount_price: 280,
      stock_quantity: 100,
      min_order_qty: 100,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    },
    {
      id: 'prod_15',
      name: 'Cumin Seeds (Jeera)',
      description: 'Aromatic cumin seeds, essential for tempering and adding flavor to Indian dishes. Fresh and pure quality.',
      category_id: 'cat_5',
      category_name: 'Spices & Herbs',
      images: ['https://images.unsplash.com/photo-1596040033229-a0b3b35b4c69?w=400'],
      unit_type: 'gram',
      sell_by: 'weight',
      base_price: 400,
      discount_price: 380,
      stock_quantity: 80,
      min_order_qty: 100,
      is_bulk_only: false,
      is_visible: true,
      is_featured: false,
      created_date: new Date().toISOString()
    }
  ];

  // Sample Promotion Banners
  const banners = [
    {
      id: 'banner_1',
      title: 'New Year Sale 2026',
      description: 'Up to 50% OFF on Fresh Fruits & Vegetables',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
      link_url: '/Products?category=cat_1',
      is_active: true,
      display_order: 1,
      created_date: new Date().toISOString()
    },
    {
      id: 'banner_2',
      title: 'Free Delivery',
      description: 'Get FREE delivery on orders above Rs. 500',
      image_url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1920&q=80',
      link_url: '/Products',
      is_active: true,
      display_order: 2,
      created_date: new Date().toISOString()
    },
    {
      id: 'banner_3',
      title: 'Fresh From Farm',
      description: 'Locally sourced organic produce delivered daily',
      image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1920&q=80',
      link_url: '/Products?featured=true',
      is_active: true,
      display_order: 3,
      created_date: new Date().toISOString()
    }
  ];

  // Sample Gallery Images
  const galleryImages = [
    {
      id: 'gallery_1',
      title: 'Fresh Groceries Banner',
      description: 'Fresh groceries with shopping cart',
      image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
      created_date: new Date().toISOString()
    },
    {
      id: 'gallery_2',
      title: 'Delivery Service',
      description: 'Delivery person with groceries',
      image_url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1920&q=80',
      created_date: new Date().toISOString()
    },
    {
      id: 'gallery_3',
      title: 'Farm Fresh Produce',
      description: 'Fresh vegetables from farm',
      image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1920&q=80',
      created_date: new Date().toISOString()
    },
    {
      id: 'gallery_4',
      title: 'Organic Vegetables',
      description: 'Fresh organic vegetables basket',
      image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1920',
      created_date: new Date().toISOString()
    },
    {
      id: 'gallery_5',
      title: 'Fresh Fruits',
      description: 'Colorful fresh fruits display',
      image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1920',
      created_date: new Date().toISOString()
    },
    {
      id: 'gallery_6',
      title: 'Dairy Products',
      description: 'Fresh milk and dairy products',
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1920',
      created_date: new Date().toISOString()
    }
  ];

  // Save to localStorage
  localStorage.setItem(categoryKey, JSON.stringify(categories));
  localStorage.setItem(productKey, JSON.stringify(products));
  localStorage.setItem(bannerKey, JSON.stringify(banners));
  localStorage.setItem(galleryKey, JSON.stringify(galleryImages));
  
  console.log('✅ Sample data initialized: 5 categories, 15 products, 3 promotion banners, and 6 gallery images added');
};

// Initialize on load
if (typeof window !== 'undefined') {
  initializeSampleData();
}

export const base44 = {
  auth,
  entities,
  integrations
};

// Expose for debugging
if (typeof window !== 'undefined') {
  window.base44 = base44;
}
