import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { exists: false, message: '请提供邮箱地址' },
        { status: 400 }
      );
    }
    
    // 使用管理员客户端检查邮箱是否存在于 ai_images_creator 表中
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('ai_images_creator')
      .select('email')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('验证邮箱时出错:', error);
      return NextResponse.json(
        { exists: false, message: '验证邮箱时出错' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      exists: !!data,
      message: data ? '邮箱已注册' : '邮箱未注册'
    });
    
  } catch (error) {
    console.error('处理邮箱验证请求时出错:', error);
    return NextResponse.json(
      { exists: false, message: '服务器错误' },
      { status: 500 }
    );
  }
} 