import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// 创建一个API端点，用于检查用户的会话状态
export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    
    return NextResponse.json({
      session: data.session ? true : false
    });
  } catch (error) {
    console.error('获取会话状态出错:', error);
    return NextResponse.json(
      { session: false, error: '检查会话状态出错' },
      { status: 500 }
    );
  }
} 