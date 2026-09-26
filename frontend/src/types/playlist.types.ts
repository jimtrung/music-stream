import { TrackDTO } from './track.types';

export interface PlaylistTrackDTO {
  id: string;
  position: number;
  track: TrackDTO;
  addedAt: string;
}

export interface PlaylistDTO {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  isPublic: boolean;
  tracks: PlaylistTrackDTO[];
  createdAt: string;
  updatedAt: string;
}
