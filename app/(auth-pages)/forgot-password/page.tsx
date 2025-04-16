'use client';

import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { KeyRound, ArrowRight, Mail } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<Message | null>(null);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  
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
  }, [searchParams]);
  
  // 检查邮箱是否存在于数据库中
  const verifyEmail = async (emailToVerify: string) => {
    if (!emailToVerify || !emailToVerify.includes('@')) {
      setIsEmailValid(false);
      setErrorMessage("");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToVerify }),
      });
      
      const data = await response.json();
      
      setIsEmailValid(data.exists);
      setErrorMessage(data.exists ? "" : "邮箱地址不对或该邮箱未注册");
    } catch (error) {
      console.error('验证邮箱时出错:', error);
      setIsEmailValid(false);
      setErrorMessage("验证邮箱时出错，请稍后再试");
    } finally {
      setIsVerifying(false);
    }
  };
  
  // 处理邮箱输入变化
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // 使用防抖，300ms后验证邮箱
    const debounceTimeout = setTimeout(() => {
      verifyEmail(newEmail);
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  };
  
  // 检查是否有成功消息
  const isSuccess = message && 'success' in message;
  
  // 处理表单提交
  const handleSubmit = (formData: FormData) => {
    if (!isEmailValid) {
      return;
    }
    
    startTransition(async () => {
      await forgotPasswordAction(formData);
    });
  };
  
  return (
    <>
      {isSuccess ? (
        <div className="w-full">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">邮件已发送</h1>
            <p className="text-gray-600 dark:text-gray-300">
               
            </p>
            <p className="text-red-500 font-medium mt-2">
            重置密码链接已发到您邮箱，请查看并修改密码。
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
              如果您没有收到邮件，请检查垃圾邮件文件夹或
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
              >
                重新发送
              </button>
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link className="text-blue-600 hover:text-blue-800 font-medium" href="/sign-in">
              返回登录页面
            </Link>
          </div>
        </div>
      ) : (
        <form className="w-full" action={handleSubmit}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600">重置密码</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              已有账号？{" "}
              <Link className="text-blue-600 hover:text-blue-800 font-medium" href="/sign-in">
                登录
              </Link>
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">邮箱</Label>
              <Input 
                name="email" 
                placeholder="你的邮箱地址" 
                required 
                className="rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={handleEmailChange}
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
            </div>
            <button 
              type="submit"
              disabled={!isEmailValid || isVerifying || isPending}
              className={`w-full py-2 rounded-lg transition-all mt-4 flex items-center justify-center ${
                isEmailValid && !isVerifying && !isPending
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isVerifying ? (
                <span className="inline-block w-4 h-4 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              重置密码
            </button>
            
            {/* 显示处理结果消息 */}
            {message && <FormMessage message={message} />}
          </div>
        </form>
      )}
      <div className="mt-6">
        <SmtpMessage />
      </div>
    </>
  );
}
