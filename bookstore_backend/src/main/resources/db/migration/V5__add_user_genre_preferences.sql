-- Add has_selected_preferences column to "user" table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS has_selected_preferences BOOLEAN DEFAULT FALSE;

-- Create user_genre_preference table
CREATE TABLE IF NOT EXISTS user_genre_preference (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    genre_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_genre_pref_user FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_genre_pref_genre FOREIGN KEY (genre_id) REFERENCES genre(genre_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_genre UNIQUE (user_id, genre_id)
);

CREATE INDEX IF NOT EXISTS idx_user_genre_pref_user_id ON user_genre_preference(user_id);
CREATE INDEX IF NOT EXISTS idx_user_genre_pref_genre_id ON user_genre_preference(genre_id);
