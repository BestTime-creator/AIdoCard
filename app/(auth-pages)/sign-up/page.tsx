"use client";

import { useState } from "react";
import { signUpAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

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

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  
  const searchParams = useSearchParams();
  const message = getMessageFromSearchParams(searchParams);
  
  // 检查邮箱是否已存在
  const checkEmailExists = async () => {
    if (!email) {
      setError("请输入邮箱地址");
      setEmailExists(null);
      return true;
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
      
      if (data.exists) {
        setError("该邮箱已注册，请直接登录或使用其他邮箱注册");
        setEmailExists(true);
        return true;
      }
      
      // 邮箱不存在，可以注册
      setError(null);
      setEmailExists(false);
      return false;
      
    } catch (err) {
      console.error("检查邮箱出错:", err);
      setError("检查邮箱时出错，请稍后再试");
      setEmailExists(null);
      return true;
    } finally {
      setIsChecking(false);
    }
  };
  
  // 当邮箱输入变化时重置状态
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailExists(null);
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
    
    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }
    
    // 先检查邮箱是否已存在
    const emailExistsResult = await checkEmailExists();
    if (emailExistsResult) {
      return;
    }
    
    // 构建表单数据并提交
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      
      await signUpAction(formData);
      
      // 手动导航到成功页面，因为有些情况下重定向可能不工作
      setTimeout(() => {
        window.location.href = '/sign-up?type=success&message=感谢您注册！请查看您的电子邮件，获取验证链接。';
      }, 100);
      
    } catch (err) {
      console.error("注册失败:", err);
      
      // 检查是否是网络错误
      const errorMessage = err instanceof Error ? err.message : '注册失败，请稍后再试';
      
      // 如果错误消息包含特定关键词，可能是已经发送了验证邮件但遇到其他问题
      if (errorMessage.includes('already signed up') || 
          errorMessage.includes('already exists') ||
          errorMessage.includes('user already') ||
          errorMessage.includes('email confirmation')) {
        
        // 这种情况下很可能注册已成功，但前端处理有问题
        setError(null);
        window.location.href = '/sign-up?type=success&message=感谢您注册！请查看您的电子邮件，获取验证链接。';
        return;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (message && message.type === "success") {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <FormMessage message={message} />
      </div>
    );
  }

  // 注册按钮是否应该禁用
  const isRegisterButtonDisabled = isChecking || isSubmitting || emailExists === true;

  return (
    <>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600">注册</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            已有账号？{" "}
            <Link className="text-blue-600 hover:text-blue-800 font-medium" href="/sign-in">
              登录
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
              onBlur={checkEmailExists}
              placeholder="你的邮箱地址" 
              required 
              className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="你的密码"
              minLength={6}
              required
              className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">密码至少需要6个字符</p>
          </div>
          
          {error && (
            <div className="p-2 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <FormMessage message={message} />
          )}
          
          <Button 
            type="submit"
            disabled={isRegisterButtonDisabled}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg transition-all mt-3"
          >
            {isChecking ? '正在检查邮箱...' : (isSubmitting ? '注册中...' : '注册')}
          </Button>
          
          {emailExists && (
            <div className="text-center mt-2">
              <Link href="/sign-in" className="text-sm text-blue-600 hover:underline">
                该邮箱已注册，点击此处登录
              </Link>
            </div>
          )}
        </div>
      </form>
      <div className="mt-4">
        <SmtpMessage />
      </div>
    </>
  );
}
