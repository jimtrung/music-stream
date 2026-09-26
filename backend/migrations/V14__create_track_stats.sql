CREATE TABLE track_stats (
    track_id UUID PRIMARY KEY REFERENCES tracks(id) ON DELETE CASCADE,
    play_count BIGINT NOT NULL DEFAULT 0,
    last_played_at TIMESTAMPTZ
);

