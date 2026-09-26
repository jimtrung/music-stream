import { http } from './http';
import * as dto from '../types/track.types'; 

export const trackApi = {
  create: (data: dto.CreateTrackRequest): Promise<dto.Track> =>    
    http.post("/track", data).then(res => res.data), 
  
  getById: (id: string): Promise<dto.Track> =>
    http.get("/track/" + id).then(res => res.data),
  
  getAll: (): Promise<Array<dto.TrackDTO>> =>
    http.get("/track").then(res => res.data),
  
  updateById: (id: string, data: dto.UploadTrackRequest): Promise<dto.Track> =>
    http.put("/track/" + id, data).then(res => res.data),
  
  deleteByUd: (id: string) => 
    http.delete("/track/" + id).then(res => res.data)
} 
