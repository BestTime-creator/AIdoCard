CREATE TABLE ai_images_creator_history (
  id BIGSERIAL PRIMARY KEY,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  image_url TEXT NOT NULL,
  prompt TEXT,
  html_file_url TEXT,
  -- 可以添加更多相关字段，如生成参数等
  CONSTRAINT fk_user
    FOREIGN KEY (uid)
    REFERENCES ai_images_creator(uid)
    ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX idx_history_uid ON ai_images_creator_history(uid);
CREATE INDEX idx_history_created_at ON ai_images_creator_history(created_at);