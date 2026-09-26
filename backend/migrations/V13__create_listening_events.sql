CREATE TABLE listening_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    listened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    listen_duration INT NOT NULL
);

CREATE INDEX idx_listening_user ON listening_events(user_id);
CREATE INDEX idx_listening_track ON listening_events(track_id);

