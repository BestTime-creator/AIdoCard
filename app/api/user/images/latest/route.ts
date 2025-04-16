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
    
    // 2. 获取用户最新的记录
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('ai_images_creator_history')
      .select('*')
      .eq('uid', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('获取最新记录失败:', error);
      return NextResponse.json({ error: '获取最新记录失败' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: '没有找到记录' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: data.id,
      image_url: data.image_url,
      html_file_url: data.html_file_url,
      created_at: data.created_at
    });
    
  } catch (error) {
    console.error('获取最新记录时出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 