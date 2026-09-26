export interface Track {
  id: string,
  artistId: string,
  artistName?: string,
  albumId?: string,
  title: string,
  audioUrl: string,
  coverUrl?: string,
  trackNumber?: number,
  createdAt: string,
  updatedAt: string
}

export interface CreateTrackRequest {
  albumId?: string,
  title: string,
  audio: File,
  cover?: File,
  trackNumber: number 
}

export interface UploadTrackRequest {
  title?: string,
  trackNumber?: number
}

export interface TrackDTO {
  id: string,
  title: string,
  artistName: string,
  audioUrl: string,
  coverUrl?: string,
  trackNumber?: number,
  duration?: number,
}
