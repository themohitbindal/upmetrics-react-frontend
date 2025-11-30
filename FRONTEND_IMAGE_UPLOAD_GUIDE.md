# Frontend Image Upload Integration Guide

## Overview
The backend now supports image file uploads for user profile images. Images are stored locally in the `public/uploads` directory and served as static files. The MongoDB database stores only the filename (not the full path), and the API returns the full URL for displaying images.

## Backend Configuration Summary

- **Storage Location:** `public/uploads/` directory
- **File Size Limit:** 5MB
- **Allowed Formats:** jpeg, jpg, png, gif, webp
- **Field Name:** `profileImage` (for FormData)
- **Image URL Format:** `http://localhost:3000/uploads/filename.jpg`

## API Endpoints That Support Image Upload

### 1. Sign Up (POST /api/auth/signup)
- Supports file upload during registration
- Field name: `profileImage`

### 2. Update User Profile (PUT /api/users/:id)
- Supports file upload when updating profile
- Field name: `profileImage`
- Old image is automatically deleted when a new one is uploaded

## Frontend Implementation

### Step 1: Update Axios Configuration

Make sure your axios instance can handle `multipart/form-data`:

```javascript
// src/api/axios.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

### Step 2: Create Image Upload Helper Function

```javascript
// src/utils/imageUpload.js

/**
 * Upload profile image
 * @param {File} file - The image file to upload
 * @param {string} userId - User ID (for update endpoint)
 * @param {Object} otherData - Other form data (name, age, etc.)
 * @param {boolean} isSignup - Whether this is for signup (true) or update (false)
 * @returns {Promise} API response
 */
export const uploadProfileImage = async (file, userId = null, otherData = {}, isSignup = false) => {
  const formData = new FormData();
  
  // Add image file
  if (file) {
    formData.append('profileImage', file);
  }
  
  // Add other form fields
  Object.keys(otherData).forEach(key => {
    if (otherData[key] !== null && otherData[key] !== undefined) {
      formData.append(key, otherData[key]);
    }
  });

  const api = (await import('../api/axios')).default;
  
  if (isSignup) {
    // Sign up endpoint
    const response = await api.post('/api/auth/signup', formData);
    return response.data;
  } else {
    // Update user endpoint
    const response = await api.put(`/api/users/${userId}`, formData);
    return response.data;
  }
};
```

### Step 3: Update API Service Functions

```javascript
// src/api/auth.js
import api from './axios';

export const authAPI = {
  signUp: async (userData, imageFile = null) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    if (userData.name) formData.append('name', userData.name);
    if (userData.age) formData.append('age', userData.age);
    
    // Add image file if provided
    if (imageFile) {
      formData.append('profileImage', imageFile);
    }
    
    const response = await api.post('/api/auth/signup', formData);
    return response.data;
  },

  signIn: async (credentials) => {
    const response = await api.post('/api/auth/signin', credentials);
    return response.data;
  },
};
```

```javascript
// src/api/users.js
import api from './axios';

export const usersAPI = {
  getById: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  update: async (userId, userData, imageFile = null) => {
    const formData = new FormData();
    
    // Add text fields
    if (userData.name) formData.append('name', userData.name);
    if (userData.age !== undefined) formData.append('age', userData.age);
    
    // Add image file if provided
    if (imageFile) {
      formData.append('profileImage', imageFile);
    }
    
    const response = await api.put(`/api/users/${userId}`, formData);
    return response.data;
  },
};
```

### Step 4: React Component Example - Sign Up with Image

```javascript
// src/components/SignUp.jsx
import { useState } from 'react';
import { authAPI } from '../api/auth';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.signUp(formData, imageFile);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirect or show success message
      console.log('Sign up successful:', response);
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label>Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}

export default SignUp;
```

### Step 5: React Component Example - Update Profile with Image

```javascript
// src/components/Profile.jsx
import { useState, useEffect } from 'react';
import { usersAPI } from '../api/users';

function Profile() {
  const userId = JSON.parse(localStorage.getItem('user'))?._id;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await usersAPI.getById(userId);
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        age: response.data.age || '',
      });
      // Set preview from existing image URL
      if (response.data.profileImage) {
        setImagePreview(getFullImageUrl(response.data.profileImage));
      }
    } catch (err) {
      setError('Failed to load user data');
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend the backend URL
    return `http://localhost:3000${imagePath}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await usersAPI.update(userId, formData, imageFile);
      setUser(response.data);
      // Update preview with new image URL
      if (response.data.profileImage) {
        setImagePreview(getFullImageUrl(response.data.profileImage));
      }
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Profile Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview && (
          <div>
            <img 
              src={imagePreview} 
              alt="Profile" 
              style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        )}
      </div>
      
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label>Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
        />
      </div>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}

export default Profile;
```

### Step 6: Display User Image Anywhere

```javascript
// src/components/UserAvatar.jsx
function UserAvatar({ user, size = 50 }) {
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/default-avatar.png'; // Fallback image
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, prepend the backend URL
    return `http://localhost:3000${imagePath}`;
  };

  return (
    <img
      src={getImageUrl(user?.profileImage)}
      alt={user?.name || 'User'}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'cover',
        borderRadius: '50%',
      }}
      onError={(e) => {
        // Fallback to default image if load fails
        e.target.src = '/default-avatar.png';
      }}
    />
  );
}

export default UserAvatar;
```

## Important Notes

1. **Image URL Format:**
   - Backend returns: `/uploads/filename.jpg` (relative path)
   - Full URL: `http://localhost:3000/uploads/filename.jpg`
   - Always prepend your backend base URL when displaying images

2. **File Validation:**
   - Maximum file size: 5MB
   - Allowed types: jpeg, jpg, png, gif, webp
   - Validate on frontend before upload for better UX

3. **FormData:**
   - Use `FormData` for file uploads
   - Don't set `Content-Type` header manually - browser will set it with boundary
   - Field name must be `profileImage`

4. **Image Preview:**
   - Use `FileReader` API for client-side preview
   - Show preview before upload for better UX

5. **Error Handling:**
   - Handle file size errors
   - Handle file type errors
   - Handle network errors
   - Show user-friendly error messages

6. **Old Image Cleanup:**
   - Backend automatically deletes old images when new ones are uploaded
   - No need to handle this on frontend

## Testing Checklist

- [ ] Can upload image during signup
- [ ] Can upload image when updating profile
- [ ] Image preview works before upload
- [ ] Image displays correctly after upload
- [ ] File size validation works (5MB limit)
- [ ] File type validation works (only images)
- [ ] Error messages display properly
- [ ] Old image is replaced when uploading new one
- [ ] Images load correctly from backend URL
- [ ] Fallback image shows when no profile image exists

## Example: Complete Image Upload Flow

```javascript
// Complete example with all features
const handleImageUpload = async (file, userId) => {
  // 1. Validate file
  if (!file.type.match('image.*')) {
    throw new Error('Please select an image file');
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be less than 5MB');
  }
  
  // 2. Create FormData
  const formData = new FormData();
  formData.append('profileImage', file);
  formData.append('name', userName);
  
  // 3. Upload
  try {
    const response = await api.put(`/api/users/${userId}`, formData);
    
    // 4. Get image URL from response
    const imageUrl = response.data.data.profileImage;
    
    // 5. Display image
    const fullUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `http://localhost:3000${imageUrl}`;
    
    return fullUrl;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
};
```

---

**That's it! Your frontend is now ready to handle image uploads and display them correctly.**

