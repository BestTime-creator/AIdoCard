import { createClient } from '@supabase/supabase-js';

// 创建具有管理员权限的Supabase客户端
export const createAdminClient = () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  return supabase;
} 