import { API_BASE_URL } from '../config/api';

class SocialAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
  }

  // Connection APIs
  async sendConnectionRequest(recipientId, message = '') {
    const response = await fetch(`${this.baseURL}/connections/send-request`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ recipientId, message })
    });
    return this.handleResponse(response);
  }

  async respondToConnectionRequest(requestId, responseType) {
    const response = await fetch(`${this.baseURL}/connections/respond/${requestId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ response: responseType })
    });
    return this.handleResponse(response);
  }

  async getMyConnections(page = 1, limit = 20) {
    const response = await fetch(`${this.baseURL}/connections/my-connections?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getPendingRequests() {
    const response = await fetch(`${this.baseURL}/connections/pending-requests`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getSentRequests() {
    const response = await fetch(`${this.baseURL}/connections/pending-requests`, {
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    // Return just the sent requests (where current user is the requester)
    return {
      success: true,
      data: data.data?.sent || []
    };
  }

  async removeConnection(connectionId) {
    const response = await fetch(`${this.baseURL}/connections/remove/${connectionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getConnectionSuggestions(limit = 10) {
    const response = await fetch(`${this.baseURL}/connections/suggestions?limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async acceptConnectionRequest(requestId) {
    const response = await fetch(`${this.baseURL}/connections/respond/${requestId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ response: 'accepted' })
    });
    return this.handleResponse(response);
  }

  async declineConnectionRequest(requestId) {
    const response = await fetch(`${this.baseURL}/connections/respond/${requestId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ response: 'declined' })
    });
    return this.handleResponse(response);
  }

  async getConnectionStatus(userId) {
    const response = await fetch(`${this.baseURL}/connections/status/${userId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserProfile(userId) {
    const response = await fetch(`${this.baseURL}/users/profile/${userId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getAllUsers(page = 1, limit = 20) {
    const response = await fetch(`${this.baseURL}/users/all?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Post APIs
  async createPost(postData) {
    // Check if we have Base64 images
    const hasBase64Images = postData.mediaBase64 && postData.mediaBase64.length > 0;
    
    if (hasBase64Images) {
      // Use JSON for Base64 images
      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          content: postData.content,
          postType: postData.postType || 'text',
          visibility: postData.visibility || 'public',
          jobId: postData.jobId,
          mediaBase64: postData.mediaBase64
        })
      });
      return this.handleResponse(response);
    } else {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('content', postData.content);
      formData.append('postType', postData.postType || 'text');
      formData.append('visibility', postData.visibility || 'public');
      
      if (postData.jobId) {
        formData.append('jobId', postData.jobId);
      }
      
      if (postData.media && postData.media.length > 0) {
        postData.media.forEach(file => {
          formData.append('media', file);
        });
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      return this.handleResponse(response);
    }
  }

  async getFeed(page = 1, limit = 10) {
    const response = await fetch(`${this.baseURL}/posts/feed?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserPosts(userId, page = 1, limit = 10) {
    const response = await fetch(`${this.baseURL}/posts/user/${userId}?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getPost(postId) {
    const response = await fetch(`${this.baseURL}/posts/${postId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updatePost(postId, updates) {
    const response = await fetch(`${this.baseURL}/posts/${postId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return this.handleResponse(response);
  }

  async deletePost(postId) {
    const response = await fetch(`${this.baseURL}/posts/${postId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async toggleLike(postId) {
    const response = await fetch(`${this.baseURL}/posts/${postId}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async addComment(postId, content) {
    const response = await fetch(`${this.baseURL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return this.handleResponse(response);
  }

  async deleteComment(postId, commentId) {
    const response = await fetch(`${this.baseURL}/posts/${postId}/comment/${commentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async sharePost(postId, comment = '') {
    const response = await fetch(`${this.baseURL}/posts/${postId}/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comment })
    });
    return this.handleResponse(response);
  }

  // Chat APIs
  async getConversations(page = 1, limit = 20) {
    const response = await fetch(`${this.baseURL}/chat/conversations?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async startConversation(participantId) {
    const response = await fetch(`${this.baseURL}/chat/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ participantId })
    });
    return this.handleResponse(response);
  }

  async getChatMessages(chatId, page = 1, limit = 50) {
    const response = await fetch(`${this.baseURL}/chat/${chatId}/messages?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async sendMessage(chatId, messageData) {
    const formData = new FormData();
    formData.append('content', messageData.content);
    
    if (messageData.replyTo) {
      formData.append('replyTo', messageData.replyTo);
    }
    
    if (messageData.file) {
      formData.append('file', messageData.file);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/chat/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  async markMessageAsRead(messageId) {
    const response = await fetch(`${this.baseURL}/chat/messages/${messageId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async markChatAsRead(chatId) {
    const response = await fetch(`${this.baseURL}/chat/${chatId}/mark-all-read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Notification APIs
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    const response = await fetch(`${this.baseURL}/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUnreadCount() {
    const response = await fetch(`${this.baseURL}/notifications/unread-count`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead() {
    const response = await fetch(`${this.baseURL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async deleteNotification(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getNotificationSettings() {
    const response = await fetch(`${this.baseURL}/notifications/settings`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateNotificationSettings(settings) {
    const response = await fetch(`${this.baseURL}/notifications/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return this.handleResponse(response);
  }

  // Recruiter Functions
  async getRecruiterPosts(page = 1, limit = 10) {
    const response = await fetch(`${this.baseURL}/posts/recruiter/all?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async hidePost(postId) {
    const response = await fetch(`${this.baseURL}/posts/recruiter/${postId}/hide`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async approvePost(postId) {
    const response = await fetch(`${this.baseURL}/posts/recruiter/${postId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async recruiterDeletePost(postId) {
    const response = await fetch(`${this.baseURL}/posts/recruiter/${postId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
}

export const socialAPI = new SocialAPI();