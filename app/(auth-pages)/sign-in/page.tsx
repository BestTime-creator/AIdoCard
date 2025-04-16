"use client";

import { useState, useEffect } from "react";
import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";

// 定义Message类型
type MessageType = {
  type: "error" | "success";
  message: string;
};

const getMessageFromSearchParams = (searchParams: URLSearchParams): MessageType | null => {
  const type = searchParams.get("type");
  const message = searchParams.get("message");
  
  if (type && message && (type === "error" || type === "success")) {
    return { type, message };
  }
  
  return null;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailRegistered, setEmailRegistered] = useState<boolean | null>(null);
  
  const searchParams = useSearchParams();
  const message = getMessageFromSearchParams(searchParams);
  const router = useRouter();
  
  // 添加检测reset参数的逻辑
  useEffect(() => {
    // 如果URL中有reset=1参数，表示是从密码重置页面跳转来的
    // 执行额外的清除操作以确保用户已完全登出
    if (searchParams.get('reset') === '1') {
      // 清除本地存储
      localStorage.clear();
      sessionStorage.clear();
      
      // 清除所有cookie
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // 如果仍然检测到登录状态，强制刷新页面
      const checkSession = async () => {
        try {
          const response = await fetch('/api/auth/session', { 
            method: 'GET',
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.session) {
            // 仍有会话，强制刷新
            window.location.reload();
          }
        } catch (e) {
          console.error('检查会话状态时出错', e);
        }
      };
      
      checkSession();
    }
  }, [searchParams]);
  
  // 检查邮箱是否已注册
  const checkEmailRegistered = async () => {
    if (!email) {
      setError("请输入邮箱地址");
      setEmailRegistered(null);
      return false;
    }
    
    try {
      setIsChecking(true);
      const response = await fetch('/api/user/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error("检查邮箱时出错");
      }
      
      const data = await response.json();
      
      if (!data.exists) {
        setError("该邮箱未注册，请先注册账号");
        setEmailRegistered(false);
        return false;
      }
      
      // 邮箱已注册，可以登录
      setError(null);
      setEmailRegistered(true);
      return true;
      
    } catch (err) {
      console.error("检查邮箱出错:", err);
      setError("检查邮箱时出错，请稍后再试");
      setEmailRegistered(null);
      return false;
    } finally {
      setIsChecking(false);
    }
  };
  
  // 当邮箱输入变化时重置状态
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailRegistered(null);
    setError(null);
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!email) {
      setError("请输入邮箱地址");
      return;
    }
    
    if (!password) {
      setError("请输入密码");
      return;
    }
    
    // 先检查邮箱是否已注册
    const isEmailRegistered = await checkEmailRegistered();
    if (!isEmailRegistered) {
      return;
    }
    
    // 构建表单数据并提交
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      
      // 调用登录action
      await signInAction(formData);
      // 如果没有重定向，则说明登录可能失败
      
    } catch (err) {
      console.error("登录失败:", err);
      setError("登录失败，请重新输入密码");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 登录按钮是否应该禁用
  const isLoginButtonDisabled = isChecking || isSubmitting || emailRegistered === false;

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600">登录</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          还没有账号？{" "}
          <Link className="text-blue-600 hover:text-blue-800 font-medium" href="/sign-up">
            注册
          </Link>
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium">邮箱</Label>
          <Input 
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={checkEmailRegistered}
            placeholder="你的邮箱地址" 
            required 
            className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-sm font-medium">密码</Label>
            <Link
              className="text-xs text-blue-600 hover:text-blue-800"
              href="/forgot-password"
            >
              忘记密码？
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="你的密码"
            required
            className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 显示错误信息 */}
        {error && (
          <div className="p-2 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* 显示来自URL的消息 */}
        {message && (
          <FormMessage message={message} />
        )}
        
        <Button 
          type="submit"
          disabled={isLoginButtonDisabled}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-all mt-3"
        >
          {isChecking ? '正在检查邮箱...' : (isSubmitting ? '登录中...' : '登录')}
        </Button>
        
        {emailRegistered === false && (
          <div className="text-center mt-2">
            <Link href="/sign-up" className="text-sm text-blue-600 hover:underline">
              该邮箱未注册，点击此处注册账号
            </Link>
          </div>
        )}
      </div>
    </form>
  );
}
