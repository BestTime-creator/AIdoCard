import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. 获取用户
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }
    
    // 2. 获取用户点数
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('ai_images_creator')
      .select('remaining_points, used_points, last_usage_time')
      .eq('uid', user.id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: '获取点数信息失败' }, { status: 500 });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('获取用户点数时出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 