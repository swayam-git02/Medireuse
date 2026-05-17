const API_BASE_URL = 'http://localhost:5000/api';

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const decodeTokenPayload = (token) => {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return null;

    const normalizedPayload = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const remainder = normalizedPayload.length % 4;
    const paddedPayload = normalizedPayload + (remainder ? '='.repeat(4 - remainder) : '');
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

const getValidAccessToken = () => {
  const rawToken = localStorage.getItem('token');
  if (!rawToken) return null;

  const token = rawToken.trim();
  if (!token || token === 'null' || token === 'undefined') {
    clearAuthStorage();
    return null;
  }

  const payload = decodeTokenPayload(token);
  if (payload?.exp && Date.now() >= payload.exp * 1000) {
    clearAuthStorage();
    return null;
  }

  return token;
};

const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.token) {
      clearAuthStorage();
      return null;
    }

    localStorage.setItem('token', data.token);
    return data.token;
  } catch {
    clearAuthStorage();
    return null;
  }
};

// fetchAPI common function hai jo backend API call karta hai.
const fetchAPI = async (endpoint, options = {}, canRetryAfterRefresh = true) => {
  const token = getValidAccessToken();
  const isFormDataRequest = options.body instanceof FormData;

  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...(isFormDataRequest ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  // Access token expire hone par refresh karke same request ko 1 baar retry karte hain.
  if (
    response.status === 401 &&
    canRetryAfterRefresh &&
    endpoint !== '/auth/login' &&
    endpoint !== '/auth/register' &&
    endpoint !== '/auth/refresh'
  ) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return fetchAPI(endpoint, options, false);
    }

    throw new Error('Session expired. Please log in again.');
  }

  // Agar backend se error aaye to readable message throw karte hain.
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthStorage();
    }

    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Authentication related saare functions yaha grouped hain.
export const authAPI = {
  // register: naya user create karta hai aur token save karta hai.
  register: async (userData) => {
    const data = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Login token + user details browser localStorage me save.
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // login: existing user ko authenticate karta hai.
  login: async (credentials) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Successful login par token/user save kar dete hain.
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // getMe: current logged-in user ki latest info backend se laata hai.
  getMe: async () => {
    return await fetchAPI('/auth/me');
  },

  // logout: token aur user data clear kar deta hai.
  logout: () => {
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }).catch(() => {});

    clearAuthStorage();
  },

  // isAuthenticated: token hai ya nahi usse login status return karta hai.
  isAuthenticated: () => {
    return !!getValidAccessToken();
  },

  // getStoredUser: localStorage me saved user object return karta hai.
  getStoredUser: () => {
    if (!getValidAccessToken()) return null;

    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },
};

// Admin panel ke API helpers.
export const adminAPI = {
  // getUsers: backend se sab users list fetch karta hai (admin only).
  getUsers: async () => {
    return await fetchAPI('/admin/users');
  },
};

// Upload related helper functions.
export const uploadAPI = {
  // uploadMedicineImage: Cloudinary par medicine image upload karta hai.
  uploadMedicineImage: async (imageData) => {
    return await fetchAPI('/uploads/medicine-image', {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  },
};

// Medicine listing related helper functions.
export const medicineAPI = {
  // createMedicine: nayi medicine listing save karta hai.
  createMedicine: async (medicineData) => {
    return await fetchAPI('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData),
    });
  },

  // getAllMedicines: browse page ke liye sab active medicines laata hai.
  getAllMedicines: async () => {
    return await fetchAPI('/medicines');
  },

  // getMyMedicines: current seller ki listed medicines laata hai.
  getMyMedicines: async () => {
    return await fetchAPI('/medicines/mine');
  },

  // deleteMedicine: current seller ki listing delete karta hai.
  deleteMedicine: async (medicineId) => {
    return await fetchAPI(`/medicines/${medicineId}`, {
      method: 'DELETE',
    });
  },
};

// Order management related functions.
export const orderAPI = {
  // createRazorpayOrder: checkout ke liye Razorpay order generate karta hai.
  createRazorpayOrder: async (paymentData) => {
    return await fetchAPI('/orders/razorpay-order', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // createOrder: naya order place karta hai.
  createOrder: async (orderData) => {
    return await fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // getMyOrders: current user ke saare orders fetch karta hai.
  getMyOrders: async () => {
    return await fetchAPI('/orders');
  },

  // getOrderById: specific order details laata hai.
  getOrderById: async (orderId) => {
    return await fetchAPI(`/orders/${orderId}`);
  },

  // updateOrder: order status/details update karta hai (mostly admin use).
  updateOrder: async (orderId, updateData) => {
    return await fetchAPI(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // cancelOrder: existing order cancel karta hai.
  cancelOrder: async (orderId) => {
    return await fetchAPI(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  // getAllOrders: admin ke liye full orders list.
  getAllOrders: async () => {
    return await fetchAPI('/orders/admin/orders');
  },
};

export default authAPI;
