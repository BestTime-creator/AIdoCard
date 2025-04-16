"use client";

import { useEffect, useState } from "react";
import { FileText, Send, Download, Sparkles, Image, Maximize, X, Layout, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { summarizationPrompt, summarizationPrompt1080 } from "@/lib/prompts";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState("");
  const [requestLength, setRequestLength] = useState(0);
  const [responseLength, setResponseLength] = useState(0);
  const [activeCardType, setActiveCardType] = useState<'vertical' | 'horizontal'>('vertical');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [operationMessage, setOperationMessage] = useState("");
  const [isDownloadingHtml, setIsDownloadingHtml] = useState(false);
  const [htmlFileUrl, setHtmlFileUrl] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // 检查用户登录状态并获取点数
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isUserLoggedIn = !!session?.user;
        setIsLoggedIn(isUserLoggedIn);
        
        // 如果用户已登录，获取点数
        if (isUserLoggedIn) {
          fetchUserPoints();
        }
        
        setCheckingAuth(false);
      } catch (error) {
        console.error("认证检查失败:", error);
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  // 获取用户点数
  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points/get');
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.remaining_points);
      }
    } catch (error) {
      console.error("获取用户点数失败:", error);
    }
  };

  // 扣除用户点数
  const deductUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation: 'deduct', points: 1 }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserPoints(data.remainingPoints);
        return true;
      } else {
        setError(data.error || "扣除点数失败");
        return false;
      }
    } catch (error) {
      console.error("扣除点数时出错:", error);
      setError("扣除点数时出错");
      return false;
    }
  };

  // 恢复用户点数（在生成失败时）
  const restoreUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation: 'add', points: 1 }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.remainingPoints);
      }
    } catch (error) {
      console.error("恢复点数时出错:", error);
    }
  };

  // 修改保存图片到历史记录的函数
  const saveImageToHistory = async (imageUrl: string, htmlContent: string, prompt: string = "") => {
    try {
      // 首先获取用户会话信息以获取UID
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("用户未登录，无法保存历史记录");
        return;
      }
      
      const uid = session.user.id;
      
      // 获取图片文件
      const imgResponse = await fetch(imageUrl);
      const imgBlob = await imgResponse.blob();
      
      // 生成文件名
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const imgFileName = `${timestamp}-${randomId}.png`;
      const htmlFileName = `${timestamp}-${randomId}.html`;
      
      // 上传图片到img-bucket
      const { data: imgData, error: imgError } = await supabase
        .storage
        .from('img-bucket')
        .upload(`${uid}/${imgFileName}`, imgBlob, {
          contentType: 'image/png',
          cacheControl: '3600'
        });
      
      if (imgError) {
        throw new Error(`上传图片失败: ${imgError.message}`);
      }
      
      // 获取图片的公共URL
      const { data: imgPublicUrl } = supabase
        .storage
        .from('img-bucket')
        .getPublicUrl(`${uid}/${imgFileName}`);
      
      // 上传HTML文件到html-file bucket
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const { data: htmlData, error: htmlError } = await supabase
        .storage
        .from('html-file')
        .upload(`${uid}/${htmlFileName}`, htmlBlob, {
          contentType: 'text/html',
          cacheControl: '3600'
        });
      
      if (htmlError) {
        throw new Error(`上传HTML文件失败: ${htmlError.message}`);
      }
      
      // 获取HTML文件的公共URL
      const { data: htmlPublicUrl } = supabase
        .storage
        .from('html-file')
        .getPublicUrl(`${uid}/${htmlFileName}`);
      
      // 保存记录到数据库
      const response = await fetch('/api/user/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imgPublicUrl.publicUrl,
          prompt,
          html_file_url: htmlPublicUrl.publicUrl
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("保存历史记录API错误:", errorData);
        throw new Error(errorData.error || "保存历史记录失败");
      }
      
      console.log("成功保存历史记录:", {
        imageUrl: imgPublicUrl.publicUrl,
        htmlFileUrl: htmlPublicUrl.publicUrl
      });
      
      return imgPublicUrl.publicUrl;
    } catch (error) {
      console.error("保存图片历史记录失败:", error);
      throw error;
    }
  };

  const handleSubmit = async (summaryType = 'vertical') => {
    if (!content.trim()) {
      setError("请输入文章内容");
      return;
    }

    // 检查用户是否已登录
    if (!isLoggedIn) {
      setError("请登录后使用，新注册用户免费赠送5个点数");
      setOperationMessage("请登录后使用，新注册用户免费赠送5个点数");
      return;
    }

    // 检查用户是否有足够的点数
    if (userPoints !== null && userPoints <= 0) {
      setError("点数不足，请充值后使用");
      setOperationMessage("点数不足，请充值后使用");
      return;
    }

    // 扣除点数，如果扣除失败则不继续
    const deductSuccess = await deductUserPoints();
    if (!deductSuccess) {
      return;
    }

    // 重置所有状态
    setIsLoading(true);
    setIsGeneratingImage(false);
    setError("");
    setOperationMessage("");
    setRequestLength(0);
    setResponseLength(0);
    setActiveCardType(summaryType as 'vertical' | 'horizontal');
    setGeneratedImageUrl(null); // 重置图片URL
    
    try {
      // 计算请求数据长度
      const requestData = { 
        content,
        summaryType 
      };
      const requestDataLength = JSON.stringify(requestData).length;
      setRequestLength(requestDataLength);

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '总结失败');
      }

      const data = await response.json();
      // 计算响应数据长度
      const responseDataLength = JSON.stringify(data).length;
      setResponseLength(responseDataLength);
      setSummary(data.summary);
      
      // 先将加载状态设为false
      setIsLoading(false);
      
      // 然后开始生成图片
      setIsGeneratingImage(true);
      
      // 确保完全重新生成图片
      try {
        const imageUrl = await generateImageAndGetUrl(data.summary, summaryType);
        setGeneratedImageUrl(imageUrl);
        
        // 保存图片到历史记录
        if (isLoggedIn) {
          const savedImageUrl = await saveImageToHistory(imageUrl, data.summary, content.substring(0, 200)); // 保存图片、HTML代码和部分内容作为提示
          // 如果成功保存并返回了新的URL，更新显示的图片URL
          if (savedImageUrl) {
            setGeneratedImageUrl(savedImageUrl);
            
            // 获取最新的HTML文件URL
            try {
              const latestResponse = await fetch('/api/user/images/latest');
              if (latestResponse.ok) {
                const latestData = await latestResponse.json();
                if (latestData.html_file_url) {
                  setHtmlFileUrl(latestData.html_file_url);
                }
              }
            } catch (error) {
              console.error("获取最新HTML文件URL失败:", error);
            }
          }
        }
      } catch (imgErr: any) {
        console.error('生成图片失败:', imgErr);
        setError(imgErr.message || '生成图片时出错');
        
        // 图片生成失败，恢复点数
        if (isLoggedIn) {
          await restoreUserPoints();
        }
      } finally {
        setIsGeneratingImage(false);
      }
    } catch (err: any) {
      console.error('总结处理失败:', err);
      setError(err.message || '生成总结时出错');
      setIsLoading(false);
      
      // 总结失败，恢复点数
      if (isLoggedIn) {
        await restoreUserPoints();
      }
    }
  };

  // 新函数：生成图片并返回URL
  const generateImageAndGetUrl = async (htmlContent: string, cardType: string): Promise<string> => {
    // 根据卡片类型设置宽度
    const imageWidth = cardType === 'horizontal' ? 1280 : 720;
    
    // 使用时间戳和随机数确保每次请求都是唯一的
    const uniqueParam = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // 使用POST请求发送HTML内容
    const response = await fetch(`/api/generate-image?t=${uniqueParam}&type=${cardType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent: htmlContent,
        width: imageWidth,
        cssStyles: `
          body { 
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            background: #f5f7fa;
            border-radius: 12px;
          }
          .prose {
            background: transparent;
          }
        `
      }),
    });
    
    if (!response.ok) {
      throw new Error('生成图片失败');
    }
    
    // 将响应转换为blob并创建一个URL
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  // 处理下载图片的函数
  const handleDownloadImage = async () => {
    if (!summary) return;
    
    setIsGeneratingImage(true);
    
    try {
      // 如果已经有生成的图片URL，直接使用它进行下载
      if (generatedImageUrl) {
        await downloadImageFile(generatedImageUrl, `article-summary-${activeCardType}.png`);
      } else {
        // 否则重新生成
        const imageUrl = await generateImageAndGetUrl(summary, activeCardType);
        setGeneratedImageUrl(imageUrl);
        await downloadImageFile(imageUrl, `article-summary-${activeCardType}.png`);
      }
    } catch (err: any) {
      console.error('下载图片失败:', err);
      setError(err.message || '下载图片时出错');
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // 从URL下载图片文件
  const downloadImageFile = async (url: string, filename: string) => {
    // 获取图片文件内容
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("获取图片文件失败");
    }
    
    // 将响应转换为blob
    const blob = await response.blob();
    
    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  };

  // 打开图片预览
  const handleOpenPreview = (imagePath: string) => {
    setPreviewImage(imagePath);
  };

  // 关闭图片预览
  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // 判断是否为横版卡片
  const isHorizontalCard = (imagePath: string | null) => {
    return imagePath?.includes('horizontal');
  };

  // 处理下载HTML的函数
  const handleDownloadHtml = async () => {
    if (!summary) return;
    
    try {
      setIsDownloadingHtml(true);
      
      // 如果已有保存的HTML文件URL，直接下载
      if (htmlFileUrl) {
        await downloadHtmlFile(htmlFileUrl);
      } else {
        // 获取最新的HTML文件URL
        const response = await fetch('/api/user/images/latest');
        
        if (!response.ok) {
          throw new Error("获取最新HTML文件失败");
        }
        
        const data = await response.json();
        
        if (!data.html_file_url) {
          throw new Error("没有找到HTML文件URL");
        }
        
        // 保存URL以便下次使用
        setHtmlFileUrl(data.html_file_url);
        
        // 下载文件
        await downloadHtmlFile(data.html_file_url);
      }
    } catch (err: any) {
      console.error('下载HTML文件失败:', err);
      setError(err.message || '下载HTML文件时出错');
    } finally {
      setIsDownloadingHtml(false);
    }
  };
  
  // 从URL下载HTML文件
  const downloadHtmlFile = async (url: string) => {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("获取HTML文件失败");
    }
    
    const blob = await response.blob();
    
    // 创建下载链接
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `article-summary-${activeCardType}.html`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  };

  // 如果正在检查认证状态，显示加载动画
  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        <span className="ml-3">加载中...</span>
      </div>
    );
  }

  // 判断按钮是否应该禁用
  const isSummarizeButtonDisabled = isLoading || (!isLoggedIn || (isLoggedIn && userPoints !== null && userPoints <= 0));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="container mx-auto px-4 py-4">
        {/* Hero Section - 减少了顶部空白区域 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-pink-600 mb-2">
            AI总结卡片
          </h1>
          <p className="text-lg text-black-600 dark:text-gray-300 max-w-2xl mx-auto">
            使用AI将您的内容转换为精美的、可分享的总结卡片
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold">粘贴您的文章</h2>
              </div>
              {/* 显示用户点数 */}
              {isLoggedIn && userPoints !== null && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    剩余点数: {userPoints}
                  </span>
                </div>
              )}
            </div>
            <Textarea
              placeholder="在此粘贴您的文章、博客文章或指南..."
              className="min-h-[200px] mb-4 rounded-lg"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {operationMessage && <p className="text-amber-500 mb-4">{operationMessage}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleSubmit('vertical')}
                disabled={isSummarizeButtonDisabled}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-lg"
              >
                {isLoading && activeCardType === 'vertical' ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成竖版卡片
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSubmit('horizontal')}
                disabled={isSummarizeButtonDisabled}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 rounded-lg"
              >
                {isLoading && activeCardType === 'horizontal' ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成横版卡片
                  </>
                )}
              </Button>
            </div>
            
            {/* 未登录用户提示 */}
            {!isLoggedIn && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-center">
                请登录使用，新注册用户免费赠送5个点数
              </div>
            )}
            
            {/* 点数不足提示 */}
            {isLoggedIn && userPoints !== null && userPoints <= 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-center">
                点数不足，无法使用，请充值后继续
              </div>
            )}
          </Card>
        </div>

        {/* Summary Result */}
        {(summary || isLoading) && (
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold">AI总结结果 ({activeCardType === 'vertical' ? '竖版' : '横版'})</h2>
                {summary && (
                  <div className="ml-auto flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadHtml}
                      disabled={isDownloadingHtml}
                      className="rounded-lg"
                    >
                      {isDownloadingHtml ? (
                        <>
                          <div className="animate-spin mr-2 h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                          下载中...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          下载HTML
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadImage}
                      disabled={isGeneratingImage}
                      className="rounded-lg"
                    >
                      {isGeneratingImage ? (
                        <>
                          <div className="animate-spin mr-2 h-3 w-3 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                          处理中...
                        </>
                      ) : (
                        <>
                          <Image className="w-4 h-4 mr-2" />
                          下载图片
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* 显示请求和响应的字符长度 */}
              {(requestLength > 0 || responseLength > 0) && (
                <div className="text-sm text-gray-500 mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p>请求数据长度: {requestLength} 字符</p>
                  <p>响应数据长度: {responseLength} 字符</p>
                </div>
              )}
              
              {/* 隐藏文字总结内容，但在加载时显示加载状态 */}
              {isLoading && (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                    <span className="ml-3">AI正在生成总结卡片<br />可能需要几分钟，请耐心等候...</span>
                  </div>
                </div>
              )}
              
              {/* 文字总结内容不再显示 */}
              <div className="hidden">
                <div dangerouslySetInnerHTML={{ __html: summary }} />
              </div>
              
              {/* 显示生成的总结图片 */}
              {isGeneratingImage && (
                <div className="mt-6 flex justify-center items-center">
                  <div className="animate-spin mr-2 h-6 w-6 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                  <span className="ml-2">正在生成{activeCardType === 'vertical' ? '竖版' : '横版'}图片...</span>
                </div>
              )}
              
              {generatedImageUrl && (
                <div className="mt-6 flex flex-col items-center">
                  <h3 className="text-lg font-medium mb-3">生成的总结卡片</h3>
                  <div className="relative group mb-4 max-w-full overflow-hidden">
                    {/* 右上角悬停显示的全屏查看按钮 */}
                    <Button
                      variant="secondary"
                      className="absolute top-2 right-2 z-10 shadow-md bg-white/80 hover:bg-white/100 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleOpenPreview(generatedImageUrl)}
                    >
                      <Maximize className="w-4 h-4 mr-2" />
                      全屏查看
                    </Button>
                    
                    <img 
                      src={generatedImageUrl} 
                      alt="生成的总结卡片"
                      className={`border rounded-lg shadow-md ${
                        activeCardType === 'horizontal' 
                          ? 'w-full max-w-3xl' 
                          : 'w-full max-w-md'
                      }`}
                    />
                    <Button
                      variant="secondary"
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleDownloadImage}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载图片
                    </Button>
                    <Button
                      variant="secondary"
                      className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleOpenPreview(generatedImageUrl)}
                    >
                      <Maximize className="w-4 h-4 mr-2" />
                      全屏查看
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 总结流程展示区域 */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">AI总结卡片是如何生成的？</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 步骤1 */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-shadow border-t-4 border-purple-500">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-center">
                <div className="inline-block rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1 text-sm font-semibold text-purple-800 dark:text-purple-200 mb-3">1</div>
                <h3 className="font-semibold text-lg mb-2">输入文字内容</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  在文本框中粘贴您需要<br />总结的文章、博客或<br />其他文字内容
                </p>
              </div>
            </Card>
            
            {/* 步骤2 */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-shadow border-t-4 border-blue-500">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <div className="inline-block rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1 text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">2</div>
                <h3 className="font-semibold text-lg mb-2">AI内容分析</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Deepseek AI智能分析<br />文章内容，提取核心观点<br />与精华信息
                </p>
              </div>
            </Card>
            
            {/* 步骤3 */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-shadow border-t-4 border-pink-500">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="text-center">
                <div className="inline-block rounded-full bg-pink-100 dark:bg-pink-900 px-3 py-1 text-sm font-semibold text-pink-800 dark:text-pink-200 mb-3">3</div>
                <h3 className="font-semibold text-lg mb-2">布局与美化</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  通过HTML5和TailwindCSS进行<br />精美排版和视觉设计
                </p>
              </div>
            </Card>
            
            {/* 步骤4 */}
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-shadow border-t-4 border-indigo-500">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <div className="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900 px-3 py-1 text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-3">4</div>
                <h3 className="font-semibold text-lg mb-2">图片转换</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  将HTML转为图片格式，方便您下载<br />分享到社交媒体
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 技术栈展示区域 */}
        <section className="max-w-4xl mx-auto mb-16 py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h2 className="text-2xl font-bold text-center mb-8">站在巨人的肩膀上</h2>
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              我们借助这些优秀的技术，为您提供高质量的AI总结卡片服务
            </p>
          </div>
          <div className="flex justify-center items-center space-x-10 px-4">
           
           {/* DeepSeek AI */}
           <div className="flex flex-col items-center justify-center">
              <div className="h-12 flex items-center justify-center mb-2">
                <img
                  src="/images/logos/deepseek.svg"
                  alt="DeepSeek AI"
                  className="h-7"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">DeepSeek</span>
            </div>

            {/* Tailwind CSS */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 flex items-center justify-center mb-2">
                <img 
                  src="/images/logos/tailwindcss.svg" 
                  alt="Tailwind CSS" 
                  className="h-6"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Tailwind CSS</span>
            </div>


            {/* HTML5 */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 flex items-center justify-center mb-2">
                <img src="/images/logos/html5.svg" alt="HTML5" className="h-8" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">HTML5</span>
            </div>

            {/* Next.js */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 flex items-center justify-center mb-2">
                <img 
                  src="/images/logos/cib-next-js.svg" 
                  alt="Next.js" 
                  className="h-8"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Next.js</span>
            </div>

             

            


            {/* Supabase */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 flex items-center justify-center mb-2">
                <img 
                  src="/images/logos/Supabase.svg"
                  alt="Supabase"
                  className="h-8"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Supabase</span>
            </div>

            {/* shadcn/ui */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 flex items-center justify-center mb-2">
                <img 
                  src="/images/logos/shadcn.svg"
                  alt="shadcn/ui"
                  className="h-8"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">shadcn/ui</span>
            </div>
          </div>
        </section>

        {/* Example Cards */}
        <section className="mb-16 bg-transparent">
          <h2 className="text-2xl font-bold text-center mb-6">AI总结卡片示例</h2>
          
          {/* 竖向卡片 */}
          <h3 className="text-xl font-medium mb-4">竖版卡片示例</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-6 bg-transparent">
            {[1, 2, 3].map((i) => (
              <div key={`vertical-${i}`} className="relative group bg-transparent shadow-none">
                <img
                  src={`/images/vertical-card-${i}.png`}
                  alt={`竖版总结卡片示例 ${i}`}
                  className="w-full h-[400px] object-cover object-top transition-transform group-hover:scale-[1.02] bg-transparent"
                />
                <Button
                  variant="secondary"
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button
                  variant="secondary"
                  className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleOpenPreview(`/images/vertical-card-${i}.png`)}
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  查看
                </Button>
              </div>
            ))}
          </div>
          
          {/* 横向卡片 */}
          <h3 className="text-xl font-medium mb-4">横版卡片示例</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-transparent">
            {[1, 2].map((i) => (
              <div key={`horizontal-${i}`} className="relative group bg-transparent shadow-none">
                <img
                  src={`/images/horizontal-card-${i}.png`}
                  alt={`横版示例总结卡片 ${i}`}
                  className="w-full h-[230px] object-cover object-top transition-transform group-hover:scale-[1.02] bg-transparent"
                />
                <Button
                  variant="secondary"
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button
                  variant="secondary"
                  className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleOpenPreview(`/images/horizontal-card-${i}.png`)}
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  查看
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* 图片预览模态框 */}
        {previewImage && (
          <div className="fixed inset-0 bg-black/80 z-50 overflow-auto pt-4">
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="icon"
                className="fixed top-4 right-4 bg-white/20 hover:bg-white/40 z-50 h-10 w-10 border-white rounded-full"
                onClick={handleClosePreview}
              >
                <X className="w-6 h-6 text-white" />
              </Button>
              <img 
                src={previewImage} 
                alt="预览图片" 
                className="w-[75%] h-auto mb-8"
                style={{ 
                  maxHeight: 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Features Section */}
        <section className="text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">为什么使用我们的<span className="text-blue-600">AI总结卡片</span>？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">AI驱动</h3>
              <p className="text-gray-600 dark:text-gray-300">
                先进的AI总结技术<br />
                提供准确简洁的内容
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-semibold mb-2">即时创建</h3>
              <p className="text-gray-600 dark:text-gray-300">快速生成精美的总结卡片</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold mb-2">轻松分享</h3>
              <p className="text-gray-600 dark:text-gray-300">下载并在任何地方分享您的卡片</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}