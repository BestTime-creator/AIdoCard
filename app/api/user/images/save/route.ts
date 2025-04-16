import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. 获取用户
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: '用户未登录' }, { status: 401 });
    }
    
    // 2. 获取图片信息
    const { imageUrl, prompt, html_file_url } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: '缺少图片URL' }, { status: 400 });
    }
    
    // 3. 保存到历史记录
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('ai_images_creator_history')
      .insert({
        uid: user.id,
        image_url: imageUrl,
        prompt: prompt || '',
        html_file_url: html_file_url || ''
      });
    
    if (error) {
      console.error('保存历史记录失败:', error);
      return NextResponse.json({ error: '保存历史记录失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('保存图片历史记录时出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 