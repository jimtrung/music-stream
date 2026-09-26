import { trackApi } from "../api/track.api";
import { Track, TrackDTO } from "../types/track.types";
import { useEffect, useState } from "react";

export const useTrack = () => {
  const [loading, setLoading] = useState(true); 
  const [tracks, setTracks] = useState<Array<TrackDTO> | null>(null);
  
  const getAll = async () => {
    const res = await trackApi.getAll();
    setTracks(res);
    return res;
  }
  
  useEffect(() => { 
    trackApi
    .getAll()
    .then((res) => {
      setTracks(res)
    })
    .finally(() => setLoading(false))
  }, []);
  
  return {
    loading,
    tracks,
    getAll 
  } 
}
