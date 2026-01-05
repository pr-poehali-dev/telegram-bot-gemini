-- Таблица для логирования диалогов с ботом
CREATE TABLE IF NOT EXISTS bot_messages (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    user_id BIGINT,
    username VARCHAR(255),
    message_text TEXT NOT NULL,
    bot_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,
    error_message TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX idx_bot_messages_chat_id ON bot_messages(chat_id);
CREATE INDEX idx_bot_messages_created_at ON bot_messages(created_at DESC);
CREATE INDEX idx_bot_messages_user_id ON bot_messages(user_id);
