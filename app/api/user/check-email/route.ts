import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 });
    }
    
    // 使用admin客户端查询数据库
    const adminClient = createAdminClient();
    
    // 查询ai_images_creator表中是否已有该邮箱
    const { data, error } = await adminClient
      .from('ai_images_creator')
      .select('email')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 是"没有找到结果"的错误代码
      console.error('检查邮箱时出错:', error);
      return NextResponse.json({ error: '检查邮箱时出错' }, { status: 500 });
    }
    
    // 如果找到数据，说明邮箱已存在
    return NextResponse.json({ exists: !!data });
    
  } catch (error) {
    console.error('检查邮箱API出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 