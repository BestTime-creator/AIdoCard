import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    return redirect("/sign-in");
  }
  
  const searchParams = await props.searchParams;
  return (
    <div className="container mx-auto px-4 py-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">重置密码</h1>
        <p className="text-gray-600 dark:text-gray-300">
          请在下方输入您的新密码
        </p>
      </div>
      
      <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
        <Label htmlFor="password">新密码</Label>
        <Input
          type="password"
          name="password"
          placeholder="请输入新密码"
          required
        />
        <Label htmlFor="confirmPassword">确认密码</Label>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="请再次输入新密码"
          required
        />
        <SubmitButton formAction={resetPasswordAction} className="mt-4">
          重置密码
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
    </div>
  );
} 