import { http } from './http';

export const artistApi = {
  getArtists: (page = 1, pageSize = 20): Promise<any[]> => 
    http.get(`/artist?page=${page}&pageSize=${pageSize}`).then(res => res.data),
  followArtist: (id: string): Promise<any> => 
    http.post(`/artist/${id}/follow`).then(res => res.data),
  unfollowArtist: (id: string): Promise<any> => 
    http.delete(`/artist/${id}/follow`).then(res => res.data),
  checkFollowStatus: (id: string): Promise<boolean> => 
    http.get(`/artist/${id}/follow/status`).then(res => res.data.isFollowing)
};
