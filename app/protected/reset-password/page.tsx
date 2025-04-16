import { redirect } from "next/navigation";

// 将受保护路径下的重置密码页面重定向到公共路径
export default function ProtectedResetPasswordRedirect({
  searchParams,
}: {
  searchParams: { email?: string; token?: string };
}) {
  const email = searchParams?.email || "";
  const token = searchParams?.token || "";
  
  // 构建重定向URL，保留所有参数
  const redirectUrl = `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  
  // 重定向到公共路径下的重置密码页面
  redirect(redirectUrl);
}
