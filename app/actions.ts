"use server";

import { createAdminClient } from '@/utils/supabase/admin';
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "需要电子邮件和密码",
    );
  }

  // 检查邮箱是否已存在于ai_images_creator表中
  const adminClient = createAdminClient();
  const { data: existingUser, error: checkError } = await adminClient
    .from('ai_images_creator')
    .select('email')
    .eq('email', email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 是"没有找到结果"的错误代码
    console.error("检查邮箱时出错:", checkError);
    return encodedRedirect("error", "/sign-up", "检查邮箱时出错，请稍后再试");
  }

  if (existingUser) {
    return encodedRedirect("error", "/sign-up", "该邮箱已注册，请直接登录或使用其他邮箱注册");
  }

  // 注册新用户
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } 
  
  // 注册成功后，我们不需要在这里手动添加ai_images_creator记录
  // 因为在SQL中已经创建了触发器，当新用户添加到auth.users表时会自动创建记录
  
  return encodedRedirect(
    "success",
    "/sign-up",
    "感谢您注册！请查看您的电子邮件，获取验证链接。",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  
  // 先检查用户是否存在于ai_images_creator表中
  const adminClient = createAdminClient();
  const { data: userData, error: userCheckError } = await adminClient
    .from('ai_images_creator')
    .select('uid, email')
    .eq('email', email)
    .single();
  
  if (userCheckError && userCheckError.code !== 'PGRST116') {
    console.error("检查用户数据时出错:", userCheckError);
  }
  
  // 尝试登录
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('登录错误:', error.message);
    
    // 对不同类型的错误进行友好提示
    if (error.message === 'Invalid login credentials') {
      if (userData) {
        // 用户存在但密码错误
        return encodedRedirect("error", "/sign-in", "输入的密码有误");
      } else {
        // 用户不存在
        return encodedRedirect("error", "/sign-in", "该邮箱未注册，请先注册账号");
      }
    } else if (error.message.includes('rate limit')) {
      return encodedRedirect("error", "/sign-in", "登录尝试次数过多，请稍后再试");
    } else {
      return encodedRedirect("error", "/sign-in", "登录失败，请稍后重试");
    }
  }

  return redirect("/personal-center");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "请输入您的邮箱地址");
  }

  // 使用自定义邮件模板方式发送重置链接
  // 
  // 重要：需要在Supabase控制台修改密码重置邮件模板
  // 1. 登录Supabase管理后台
  // 2. 进入Authentication -> Email Templates -> Reset Password
  // 3. 找到邮件内容中的链接部分，例如：<a href="{{ .ConfirmationURL }}">重置密码</a>
  // 4. 替换为：<a href="{{ .SiteURL }}/reset-password?email={{ .Email }}&token={{ .Token }}">重置密码</a>
  // 5. 保存模板
  // 
  // 这样用户点击邮件中的链接就会直接进入重置密码页面，而不是登录页面
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "无法重置密码，请稍后再试",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  // 无论成功与否，都返回到忘记密码页面，并显示消息
  return encodedRedirect(
    "success",
    "/forgot-password",
    "请检查您的电子邮件，查找重置密码的链接",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  if (!password || !confirmPassword) {
    return { success: false, message: "需要密码和确认密码" };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "密码不匹配" };
  }
  
  if (!email || !token) {
    return { success: false, message: "邮箱或验证码缺失，请重新点击重置链接" };
  }

  let userId = '';
  
  try {
    // 1. 先使用OTP验证用户身份
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    if (verifyError || !verifyData.session) {
      console.error("验证失败:", verifyError);
      return { success: false, message: "验证链接已过期或无效，请重新获取" };
    }
    
    // 获取用户ID用于后续操作
    userId = verifyData.user?.id || '';

    // 2. 验证成功后，更新用户密码
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error("密码更新失败:", updateError);
      return { success: false, message: "密码更新失败，请稍后再试" };
    }
  } catch (err) {
    console.error("密码重置过程中出错:", err);
    return { success: false, message: "重置密码时出错，请稍后再试" };
  }

  // 3. 更新成功后，强制退出所有会话 - 使用多种方式确保彻底登出
  try {
    // 3.1 使用管理员API使所有会话失效
    if (userId) {
      try {
        // 使用管理员API使所有会话失效
        await adminClient.auth.admin.deleteUser(userId);
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });
        console.log(`已重新创建用户 ${userId} 的账户，所有旧会话已失效`);
      } catch (adminError) {
        console.error("使用管理员API重置用户失败:", adminError);
      }
    }
    
    // 3.2 使用当前客户端登出
    await supabase.auth.signOut({ scope: 'global' });
    
    // 3.3 删除所有相关cookie以确保彻底登出
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    for (const cookie of allCookies) {
      // 清除所有Supabase相关cookie
      if (cookie.name.includes('sb-') || 
          cookie.name.includes('supabase') || 
          cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name);
      }
    }

    // 3.4 响应中添加清除cookie的指令
    const res = new Response(null);
    res.headers.set('Set-Cookie', 'sb-access-token=; Max-Age=0; Path=/; HttpOnly');
    res.headers.append('Set-Cookie', 'sb-refresh-token=; Max-Age=0; Path=/; HttpOnly');
  } catch (logoutError) {
    console.error("登出过程中出错:", logoutError);
    // 继续执行，不影响密码重置成功状态
  }

  // 返回结果，包含强制刷新标记
  return { 
    success: true, 
    message: "密码已更新，请使用新密码登录",
    requireLogin: true,
    forceRefresh: true // 添加标记，指示客户端需要强制刷新页面
  };
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
