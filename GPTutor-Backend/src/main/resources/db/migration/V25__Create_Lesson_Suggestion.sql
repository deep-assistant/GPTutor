CREATE TABLE lesson_suggestion
(
    id              UUID NOT NULL,
    vk_user_id      UUID NOT NULL,
    lesson_name     VARCHAR(255),
    description     VARCHAR(1000),
    category        VARCHAR(255),
    content         TEXT,
    created_at      TIMESTAMP,
    status          VARCHAR(20) DEFAULT 'PENDING',
    PRIMARY KEY (id)
);