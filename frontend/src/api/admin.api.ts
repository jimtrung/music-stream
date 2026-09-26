import { http } from './http';

export interface DashboardStats {
  totalUsers: number;
  totalArtists: number;
  totalTracks: number;
  totalRevenue: number;
  revenueGrowth: number;
  userGrowth: number;
  monthlyRevenue: { month: string; amount: number }[];
}

export const adminApi = {
  getStats: (): Promise<DashboardStats> => 
    http.get('/admin/stats').then(res => res.data),
    
  getUsers: (): Promise<any[]> => 
    http.get('/admin/users').then(res => res.data),
    
  getArtists: (): Promise<any[]> => 
    http.get('/admin/artists').then(res => res.data),
    
  getTracks: (): Promise<any[]> => 
    http.get('/track').then(res => res.data), // Reusing track/all logic
    
  deleteUser: (id: string): Promise<any> =>
    http.delete(`/admin/users/${id}`).then(res => res.data),

  updateUserRole: (id: string, role: string, isVerified: boolean): Promise<any> =>
    http.put(`/admin/users/${id}`, { role, isVerified }).then(res => res.data),

  deleteArtist: (id: string): Promise<any> =>
    http.delete(`/admin/artists/${id}`).then(res => res.data),

  deleteTrack: (id: string): Promise<any> =>
    http.delete(`/admin/tracks/${id}`).then(res => res.data),
};
