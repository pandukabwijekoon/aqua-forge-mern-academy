/**
 * Aqua Forge Frontend API client
 * Handles communication with the backend with JWT authorization headers
 */

const getHeaders = () => {
  const token = localStorage.getItem('aquaforge_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || 'An error occurred during transaction execution.';
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // 1. Authentication Endpoints
  auth: {
    register: async (userData) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    login: async (credentials) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // 2. Coach Roster Endpoints
  coaches: {
    getAll: async () => {
      const res = await fetch('/api/coaches', {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`/api/coaches/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // 3. Scheduling & Bookings Endpoints
  bookings: {
    initiate: async (bookingData) => {
      const res = await fetch('/api/bookings/secure-initiate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bookingData),
      });
      return handleResponse(res);
    },
    uploadSlip: async (bookingId, slipData) => {
      const res = await fetch(`/api/bookings/upload-slip/${bookingId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(slipData),
      });
      return handleResponse(res);
    },
    getMyBookings: async () => {
      const res = await fetch('/api/bookings/my', {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    cancel: async (id) => {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getPending: async () => {
      const res = await fetch('/api/bookings/pending', {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getHistory: async () => {
      const res = await fetch('/api/bookings/history', {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    verify: async (id, approve) => {
      const res = await fetch(`/api/bookings/verify/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ approve }),
      });
      return handleResponse(res);
    },
    getSchedulerView: async (profileId) => {
      const res = await fetch(`/api/bookings/scheduler-view/${profileId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // 4. Swimmer Profile Relational Endpoints
  profiles: {
    getAll: async () => {
      const res = await fetch('/api/profiles', {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    register: async (profileData) => {
      const res = await fetch('/api/profiles/register', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(res);
    },
    update: async (profileId, profileData) => {
      const res = await fetch(`/api/profiles/update/${profileId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      return handleResponse(res);
    },
  },
};

export default api;
