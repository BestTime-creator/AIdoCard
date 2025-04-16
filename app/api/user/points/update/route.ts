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
    
    // 2. 获取操作类型
    const { operation, points = 1 } = await request.json();
    
    // 3. 使用admin客户端更新点数
    const adminClient = createAdminClient();
    
    // 获取当前用户的点数信息
    const { data: userData, error: fetchError } = await adminClient
      .from('ai_images_creator')
      .select('remaining_points, used_points')
      .eq('uid', user.id)
      .single();
    
    if (fetchError || !userData) {
      return NextResponse.json({ error: '获取用户数据失败' }, { status: 500 });
    }
    
    // 检查用户是否有足够的点数（仅当是扣减操作时）
    if (operation === 'deduct' && userData.remaining_points < points) {
      return NextResponse.json({ error: '点数不足', remainingPoints: userData.remaining_points }, { status: 400 });
    }
    
    // 根据操作类型更新点数
    let updateData = {};
    if (operation === 'deduct') {
      updateData = {
        remaining_points: userData.remaining_points - points,
        used_points: userData.used_points + points,
        last_usage_time: new Date()
      };
    } else if (operation === 'add') {
      updateData = {
        remaining_points: userData.remaining_points + points
      };
    } else {
      return NextResponse.json({ error: '不支持的操作类型' }, { status: 400 });
    }
    
    // 更新数据库
    const { error: updateError } = await adminClient
      .from('ai_images_creator')
      .update(updateData)
      .eq('uid', user.id);
    
    if (updateError) {
      return NextResponse.json({ error: '更新点数失败' }, { status: 500 });
    }
    
    // 返回更新后的点数
    return NextResponse.json({ 
      success: true, 
      remainingPoints: operation === 'deduct' 
        ? userData.remaining_points - points 
        : userData.remaining_points + points 
    });
    
  } catch (error) {
    console.error('更新点数时出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 