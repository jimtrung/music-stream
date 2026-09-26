import { http } from './http';
import * as dto from '../types/auth.types';

export const authApi = {
  signup: (data: dto.SignUpRequest) =>  
    http.post("/auth/signup", data).then(res => res.data),
  
  signin: async (data: dto.SignInRequest): Promise<dto.SignInResponse> => { 
    const res = await http.post("/auth/signin", data)
    return res.data;  
  },
  
  logout: () => {},
  
  refresh: (): Promise<dto.RefreshResponse>  => 
    http.get("/auth/refresh").then(res => res.data),
    
  resendVerificationEmail: (data: dto.ResendVerificationEmailRequest) =>
    http.post("/auth/resend-verification-email", data).then(res => res.data),
   
  me: () => 
    http.get("/auth/me").then(res => res.data),
  
  profile: () => 
    http.get("/auth/profile").then(res => res.data),

  getProfileByUsername: (username: string) =>
    http.get(`/auth/profile/${username}`).then(res => res.data),
  
  updateProfile: (data: dto.UpdateProfileRequest) =>
    http.put("/auth/profile", data).then(res => res.data)
}
