'use client';

import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, CheckCircle } from "lucide-react";
import { useState, useEffect, useTransition } from "react";

// 强制清除客户端会话的函数
function clearClientSession() {
  try {
    // 清除所有可能包含会话信息的存储
    localStorage.clear();
    sessionStorage.clear();
    
    // 特别清除Supabase相关的项目
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    
    // 清除所有cookie
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    console.log('已清除客户端会话数据');
  } catch (error) {
    console.error('清除客户端会话时出错:', error);
  }
}

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // 从URL中获取用户邮箱和token
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  
  // 从URL参数中提取消息
  useEffect(() => {
    const type = searchParams.get("type");
    const messageText = searchParams.get("message");
    
    if (type && messageText) {
      if (type === "success") {
        setMessage({ success: messageText });
      } else if (type === "error") {
        setMessage({ error: messageText });
      }
    } else {
      setMessage(null);
    }
    
    // 检查是否有必要的参数
    if (!email || !token) {
      router.push("/forgot-password?type=error&message=重置链接无效，请重新获取");
    }
  }, [email, token, router, searchParams]);
  
  // 倒计时效果
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      // 强制刷新方式跳转到登录页面
      clearClientSession();
      window.location.href = "/sign-in?reset=1";
    }
  }, [isSuccess, countdown]);
  
  // 验证密码匹配
  const validatePasswords = () => {
    if (password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  };
  
  // 在密码变化时验证匹配
  useEffect(() => {
    validatePasswords();
  }, [password, confirmPassword]);
  
  // 处理密码变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  // 处理确认密码变化
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };
  
  // 重定向到登录页面
  const goToSignIn = () => {
    // 先清除会话数据
    clearClientSession();
    // 使用location.href强制刷新页面
    window.location.href = "/sign-in?reset=1";
  };
  
  // 处理表单提交
  const handleSubmit = async (formData: FormData) => {
    if (!passwordMatch) {
      setMessage({ error: "两次输入的密码不一致，请重新输入" });
      return;
    }
    
    startTransition(async () => {
      try {
        const result = await resetPasswordAction(formData);
        
        if (result.success) {
          // 立即清除客户端会话
          clearClientSession();
          
          setIsSuccess(true);
          setMessage({ success: result.message });
          
          // 如果服务器请求强制刷新，立即执行
          if (result.forceRefresh) {
            // 添加一个短暂延迟确保数据被清除
            setTimeout(() => {
              window.location.href = "/sign-in?reset=1";
            }, 100);
          }
        } else {
          setMessage({ error: result.message });
        }
      } catch (error) {
        setMessage({ error: "重置密码时出错，请稍后再试" });
      }
    });
  };
  
  if (!email || !token) {
    return null; // 防止在重定向前闪烁内容
  }
  
  // 如果已经成功重置密码，显示成功信息并倒计时
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="flex flex-col w-full p-6 gap-4 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">密码重置成功！</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              您的密码已成功更新，请使用新密码登录
            </p>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto my-6">
              <span className="text-2xl font-bold text-blue-600">{countdown}</span>
            </div>
            <p className="text-blue-500 font-medium mb-6">
              {countdown}秒后自动跳转到登录页面...
            </p>
            <button 
              onClick={goToSignIn}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              立即前往登录
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <form className="flex flex-col w-full p-6 gap-4 bg-white dark:bg-gray-800 shadow-xl rounded-xl" action={handleSubmit}>
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600">重置密码</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            为账号 <span className="font-medium">{email}</span> 设置新密码
            <br /><br />
            请输入新密码，两次密码一致后<br />重置密码按钮才可使用。
          </p>
        </div>
        
        {/* 隐藏字段：传递必要参数 */}
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">新密码</Label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="请输入新密码"
            className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            required
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">确认密码</Label>
          <Input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="请再次输入新密码"
            className={`rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 ${!passwordMatch ? 'border-red-500 dark:border-red-500' : ''}`}
            required
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          {!passwordMatch && (
            <p className="text-red-500 text-sm mt-1">两次输入的密码不一致，请重新输入</p>
          )}
        </div>
        
        <button 
          type="submit"
          disabled={!passwordMatch || isPending || !password || !confirmPassword}
          className={`w-full py-2 rounded-lg transition-all mt-4 flex items-center justify-center ${
            passwordMatch && !isPending && password && confirmPassword
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {isPending ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          ) : (
            <KeyRound className="w-4 h-4 mr-2" />
          )}
          重置密码
        </button>
        
        {message && <FormMessage message={message} />}
      </form>
    </div>
  );
} 