CREATE TABLE ai_images_creator (
  id BIGSERIAL PRIMARY KEY,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  registration_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  remaining_points INTEGER DEFAULT 5,
  used_points INTEGER DEFAULT 0,
  last_usage_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(uid)
);

-- 创建触发器，确保新用户注册时自动获得5个点数
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ai_images_creator (uid, email, remaining_points)
  VALUES (new.id, new.email, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 将触发器绑定到auth.users表的INSERT事件
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();