import axios, { AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


const excludeUrls = ['/auth/refresh', '/auth/signin', '/auth/signup', '/auth/google-signin', '/auth/intra-signin', '/auth/signout', '/auth/me'];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

api.interceptors.response.use(
  (response: AxiosResponse) => {
    refreshAttempts = 0;
    return response;
  },
  async (err: Error) => {
    const error = err as Error & {
      config: {
        [key: string]: unknown
      }; response?: { status: number }
    };
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry && !excludeUrls.includes(originalRequest?.url as string)) {
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        refreshAttempts = 0;
        return Promise.reject(new Error('Max refresh attempts exceeded'));
      }

      originalRequest._retry = true;
      refreshAttempts++;

      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (error) {
        const refreshError = error as Error & { response?: { status: number } };
        if (refreshError.response && refreshError.response.status === 401) {
          refreshAttempts = 0;
          return Promise.reject(new Error('Refresh token expired'));
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;



export interface TournamentPayload {
  players: string[];
}

export const createTournamentInApi = async (data: TournamentPayload) => {
  try {
    const response = await api.post('/tournaments', data);
    return response.data;
  } catch (error: any) {
    console.log('Tournament creation error:', error.response?.data);

    if (error.response?.status === 400 && error.response?.data?.details) {
      const details = error.response.data.details;
      const errorMessages = details.map((d: { field: string; message: string }) =>
        `${d.field}: ${d.message}`
      ).join(', ');
      throw new Error(errorMessages);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      throw new Error(`Failed to create tournament: ${errorMessage}`);
    }
  }
};

export const updateTournamentInApi = async (
  id: string,
  winnerName: string
) => {
  try {
    const response = await api.put(`/tournaments/${id}`, { winner: winnerName });
    return response.data;
  } catch (error: any) {
    console.error("Error updating tournament:", error);
    const errorMessage = error.response?.data?.message || error.message || "Unknown error";
    throw new Error(`Failed to update tournament: ${errorMessage}`);
  }
};

export const getTournamentFromApi = async (id: string) => {
  try {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tournament:", error);
    throw error;
  }
};

export const getGamesFromApi = async (tournamentId: string) => {
  try {
    const response = await api.get(`/games/by-tournament/${tournamentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
};


export interface User {
  id_user: number;
  username: string;
  fullName: string;
  email: string;
  status?: string;
  avatar?: string;
  wins?: number;
  losses?: number;
  createdAt?: string;
}



export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(username)}`);
    const users = response.data;

    const user = users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());
    return user || null;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return null;
  }
};

export const getUserFriends = async (id: number): Promise<User[]> => {
  try {
    const response = await api.get(`/friends/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user friends:", error);
    return [];
  }
};

export const getUserGames = async (id: number) => {
  try {
    const response = await api.get(`/games/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user games:", error);
    return [];
  }
};


export interface Avatar {
  id: string;
  url: string;
  name: string;
}

export interface AvatarListResponse {
  defaults: Avatar[];
  custom: Avatar[];
}

export const uploadAvatar = async (file: File): Promise<{ success: boolean; avatar: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    throw new Error(error.response?.data?.error || 'Failed to upload avatar');
  }
};

export const setAvatar = async (avatarUrl: string): Promise<{ success: boolean; avatar: string }> => {
  try {
    const response = await api.post('/avatar/set', { avatarUrl });
    return response.data;
  } catch (error: any) {
    console.error("Error setting avatar:", error);
    throw new Error(error.response?.data?.error || 'Failed to set avatar');
  }
};

export const deleteAvatar = async (avatarUrl: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete('/avatar', { data: { avatarUrl } });
    return response.data;
  } catch (error: any) {
    console.error("Error deleting avatar:", error);
    throw new Error(error.response?.data?.error || 'Failed to delete avatar');
  }
};

export const getAvatarList = async (): Promise<AvatarListResponse> => {
  try {
    const response = await api.get('/avatar/list');
    return response.data;
  } catch (error: any) {
    console.error("Error fetching avatars:", error);
    return { defaults: [], custom: [] };
  }
};

export const getCurrentAvatar = async (): Promise<string> => {
  try {
    const response = await api.get('/avatar/current');
    return response.data.avatar;
  } catch (error) {
    console.error("Error fetching current avatar:", error);
    return '';
  }
};