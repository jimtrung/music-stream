import { http } from './http';
import * as dto from '../types/playlist.types'; 
import { getCoverUrl } from '../utils/urlUtil';
import type { Playlist, Track } from '../types';

export const mapPlaylistDTOToPlaylist = (playlistDto: dto.PlaylistDTO): Playlist & { tracksData: Track[] } => {
  // Get first track's cover for playlist cover
  const firstTrackCover = playlistDto.tracks.length > 0 
    ? getCoverUrl(playlistDto.tracks[0]?.track.coverUrl)
    : undefined;

  // Map DTO tracks to Track objects
  const tracksData: Track[] = playlistDto.tracks.map(t => ({
    id: t.track.id,
    title: t.track.title,
    artistId: '',
    artistName: t.track.artistName,
    audioUrl: t.track.audioUrl,
    coverUrl: t.track.coverUrl,
    trackNumber: t.track.trackNumber,
    duration: t.track.duration || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  return {
    id: playlistDto.id,
    name: playlistDto.name,
    cover: firstTrackCover || '', 
    description: playlistDto.isPublic ? 'Public Playlist' : 'Private Playlist',
    owner: playlistDto.ownerName,
    ownerId: playlistDto.ownerId,
    trackIds: tracksData.map(t => t.id),
    followers: 0,
    tracksData,
  };
};

export const playlistApi = {
  getAll: (): Promise<Array<dto.PlaylistDTO>> =>
    http.get("/playlist/all").then(res => res.data),
  
  getById: (id: string): Promise<dto.PlaylistDTO> =>
    http.get(`/playlist/${id}`).then(res => res.data)
};
