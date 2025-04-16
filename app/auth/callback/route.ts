import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  
  // 检查是否存在包含重置密码信息的查询参数
  const authToken = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const email = requestUrl.searchParams.get("email");
  
  // 如果是密码重置请求，不交换代码也不创建会话
  if (authToken && type === "recovery" && email) {
    const resetPasswordUrl = `${origin}/protected/reset-password?token=${encodeURIComponent(authToken)}&email=${encodeURIComponent(email)}`;
    return NextResponse.redirect(resetPasswordUrl);
  }
  
  // 常规登录流程
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/personal-center`);
}
