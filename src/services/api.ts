// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' 
    ? (window.location.origin + '/api') 
    : 'http://localhost:3001/api'
);

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: any;
}

interface PaginationInfo {
  current: number;
  total: number;
  limit: number;
  count: number;
  totalRecords: number;
}

interface EventsResponse {
  events: Event[];
  pagination?: PaginationInfo;
}

interface GalleryResponse {
  images: GalleryImage[];
  pagination?: PaginationInfo;
}

// Event interface matching the backend model
export interface Event {
  _id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  tags: string[];
  blurb: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationLink?: string;
  capacity?: number;
  currentRegistrations?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Gallery image interface matching the backend model
export interface GalleryImage {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  alt: string;
  category: string;
  s3Key: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Events API
export const eventsApi = {
  // Get all events with optional filtering
  getAll: async (params: {
    status?: string;
    limit?: number;
    page?: number;
    category?: string;
  } = {}): Promise<EventsResponse> => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest<EventsResponse>(endpoint);
    return response.data;
  },
  
  // Get upcoming events
  getUpcoming: async (limit: number = 10): Promise<{ events: Event[] }> => {
    const response = await apiRequest<EventsResponse>(`/events?status=upcoming&limit=${limit}`);
    return { events: response.data.events };
  },
  
  // Get single event by ID
  getById: async (id: string): Promise<{ event: Event }> => {
    const response = await apiRequest<{ event: Event }>(`/events?eventId=${id}`);
    return response.data;
  },
  
  // Create new event (admin only)
  create: async (eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt' | 'isActive' | 'priority'>, token: string): Promise<{ event: Event }> => {
    const response = await apiRequest<{ event: Event }>('/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    return response.data;
  },
  
  // Update event (admin only)
  update: async (id: string, eventData: Partial<Event>, token: string): Promise<{ event: Event }> => {
    const response = await apiRequest<{ event: Event }>(`/events?eventId=${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    return response.data;
  },
  
  // Delete event (admin only)
  delete: async (id: string, token: string): Promise<void> => {
    await apiRequest(`/events?eventId=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Update registration count
  updateRegistration: async (id: string, increment: number = 1): Promise<{ event: Event }> => {
    const response = await apiRequest<{ event: Event }>(`/events/${id}/registration`, {
      method: 'PATCH',
      body: JSON.stringify({ increment })
    });
    return response.data;
  },
  
  // Update event status (admin only)
  updateStatus: async (id: string, status: string, isActive?: boolean, token?: string): Promise<{ event: Event }> => {
    const response = await apiRequest<{ event: Event }>(`/events/${id}/status`, {
      method: 'PATCH',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ status, isActive })
    });
    return response.data;
  }
};

// Gallery API
export const galleryApi = {
  // Get all images with optional filtering
  getAll: async (params: {
    category?: string;
    limit?: number;
    page?: number;
    sort?: string;
    featured?: boolean;
  } = {}): Promise<GalleryResponse> => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const endpoint = `/gallery${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest<GalleryResponse>(endpoint);
    return response.data;
  },
  
  // Get images by category
  getByCategory: async (category: string, limit: number = 20): Promise<{ images: GalleryImage[]; category: string }> => {
    const response = await apiRequest<{ images: GalleryImage[]; category: string }>(`/gallery/category/${category}?limit=${limit}`);
    return response.data;
  },
  
  // Get available categories
  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await apiRequest<{ categories: string[] }>('/gallery/categories');
    return response.data;
  },
  
  // Get single image by ID
  getById: async (id: string): Promise<{ image: GalleryImage }> => {
    const response = await apiRequest<{ image: GalleryImage }>(`/gallery/${id}`);
    return response.data;
  },
  
  // Upload new image (admin only)
  upload: async (formData: FormData, token: string): Promise<{ image: GalleryImage }> => {
    const response = await apiRequest<{ image: GalleryImage }>('/gallery/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - let the browser set it for FormData
      },
      body: formData
    });
    return response.data;
  },
  
  // Update image metadata (admin only)
  update: async (id: string, imageData: Partial<GalleryImage>, token: string): Promise<{ image: GalleryImage }> => {
    const response = await apiRequest<{ image: GalleryImage }>(`/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(imageData)
    });
    return response.data;
  },
  
  // Delete image (admin only)
  delete: async (id: string, permanent: boolean = false, token: string): Promise<void> => {
    await apiRequest(`/gallery/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Admin API
export const adminApi = {
  // Admin login
  login: async (username: string, password: string): Promise<{ token: string; user: { username: string; role: string } }> => {
    const response = await apiRequest<{ token: string; user: { username: string; role: string } }>('/admin?action=login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    return response.data;
  },
  
  // Get dashboard data
  getDashboard: async (token: string): Promise<any> => {
    const response = await apiRequest('/admin?action=dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },
  
  // Verify token
  verifyToken: async (token: string): Promise<{ user: any }> => {
    const response = await apiRequest<{ user: any }>('/admin?action=verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};

// Local storage helpers for admin token
export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('admin_token');
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('admin_token', token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem('admin_token');
  },
  
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('admin_token');
    return !!token;
  }
};

// Contact interface matching the backend model
export interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  response?: string;
  timeAgo?: string;
}

interface ContactsResponse {
  contacts: Contact[];
  pagination?: PaginationInfo;
  statusCounts?: {
    new: number;
    read: number;
    responded: number;
    archived: number;
    total: number;
  };
}


// Contacts API
export const contactsApi = {
  // Public endpoint - submit contact form
  submit: async (contactData: { name: string; email: string; message: string }) => {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json() as Promise<ApiResponse<{ id: string; timestamp: string }>>;
  },
  
  // Admin endpoints
  getAll: async (params?: { page?: number; limit?: number; status?: string; search?: string }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/contacts?${searchParams}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json() as Promise<ApiResponse<ContactsResponse>>;
  },
  
  getById: async (id: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/contacts?contactId=${id}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json() as Promise<ApiResponse<Contact>>;
  },
  
  updateStatus: async (id: string, status: string, response?: string, token?: string) => {
    const requestData: any = { status };
    if (response) requestData.response = response;
    
    const apiResponse = await fetch(`${API_BASE_URL}/contacts?contactId=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(requestData)
    });
    
    if (!apiResponse.ok) {
      throw new Error(`HTTP error! status: ${apiResponse.status}`);
    }
    
    return apiResponse.json() as Promise<ApiResponse<Contact>>;
  },
  
  delete: async (id: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/contacts?contactId=${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json() as Promise<ApiResponse<{}>>;
  },
  
  getStats: async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/contacts/stats`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json() as Promise<ApiResponse<any>>;
  }
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};