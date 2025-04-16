"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Image, Download, Maximize, X, FileText, Sparkles } from "lucide-react";

export default function PersonalCenter() {
  const [userPoints, setUserPoints] = useState<any>(null);
  const [imageHistory, setImageHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloadingHtml, setDownloadingHtml] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/sign-in');
        return;
      }
      
      // 获取用户点数
      fetchUserPoints();
      
      // 获取历史记录
      fetchImageHistory();
    }
    
    checkAuth();
  }, []);
  
  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points/get');
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data);
      }
    } catch (error) {
      console.error("获取用户点数失败:", error);
    }
  };
  
  const fetchImageHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/images/history');
      if (response.ok) {
        const data = await response.json();
        setImageHistory(data.history || []);
      }
    } catch (error) {
      console.error("获取历史记录失败:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 打开图片预览
  const handleOpenPreview = (imagePath: string) => {
    setPreviewImage(imagePath);
    setIsZoomed(false); // 重置缩放状态
  };

  // 关闭图片预览
  const handleClosePreview = () => {
    setPreviewImage(null);
    setIsZoomed(false); // 重置缩放状态
  };
  
  // 切换图片缩放状态
  const handleToggleZoom = () => {
    // 切换缩放状态
    setIsZoomed(prev => !prev);
    
    // 如果是放大，则滚动到顶部
    if (!isZoomed) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);
    }
  };
  
  // 跳转到首页
  const goToHomePage = () => {
    router.push('/');
  };
  
  // 下载图片
  const handleDownloadImage = (imageUrl: string, filename: string = "ai-summary-image.png") => {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(error => console.error("下载图片失败:", error));
  };
  
  // 下载HTML代码
  const handleDownloadHtml = async (htmlFileUrl: string, itemId: number, filename: string = "ai-summary-html.html") => {
    if (!htmlFileUrl) {
      alert("没有可用的HTML文件");
      return;
    }
    
    try {
      // 显示特定项目的加载状态
      setDownloadingHtml(itemId);
      
      // 从URL获取文件内容
      const response = await fetch(htmlFileUrl);
      
      if (!response.ok) {
        throw new Error("获取HTML文件失败");
      }
      
      // 将响应转换为blob
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("下载HTML文件失败:", error);
      alert("下载HTML文件失败");
    } finally {
      setDownloadingHtml(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        <span className="ml-3">加载中...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">个人中心</h1>
      
      {/* 使用AI总结卡片按钮 - 移动到标题下方 */}
      <div className="flex justify-center mb-8">
        <Button 
          onClick={goToHomePage}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 px-8 rounded-lg text-lg font-medium shadow-lg transition-all"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          使用AI总结卡片
        </Button>
      </div>
      
      {/* 用户点数信息 */}
      {userPoints && (
        <Card className="p-6 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <h2 className="text-xl font-semibold mb-4">我的点数</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">剩余点数</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{userPoints.remaining_points}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">已使用点数</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{userPoints.used_points}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">最后使用时间</p>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-300">
                {userPoints.last_usage_time ? new Date(userPoints.last_usage_time).toLocaleString() : '暂无记录'}
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* 历史记录 */}
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <h2 className="text-xl font-semibold mb-4">我的历史记录</h2>
        
        {imageHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无历史记录
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageHistory.map((item) => (
              <div key={item.id} className="relative group overflow-hidden rounded-lg border shadow-sm flex flex-col h-[200px]">
                <div className="relative h-[190px] overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt="历史记录" 
                    className="w-full h-full object-cover object-top transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleOpenPreview(item.image_url)}
                    >
                      <Maximize className="w-4 h-4 mr-1" />
                      查看
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 mt-auto">
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadImage(item.image_url, `ai-summary-${item.id}.png`)}
                      className="flex-1 mr-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      下载图片
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadHtml(item.html_file_url, item.id, `ai-summary-${item.id}.html`)}
                      className="flex-1 ml-1"
                      disabled={!item.html_file_url || downloadingHtml === item.id}
                    >
                      {downloadingHtml === item.id ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                          下载中...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-1" />
                          下载HTML
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* 图片预览模态框 */}
      {previewImage && (
        <div 
          className={`fixed inset-0 bg-black/80 z-50 overflow-auto flex items-start justify-center`}
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className={`flex flex-col items-center ${isZoomed ? 'w-full pt-16 pb-20' : 'max-h-screen pt-4'} relative`}>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 right-4 bg-white/20 hover:bg-white/40 z-50 h-10 w-10 border-white rounded-full"
              onClick={handleClosePreview}
            >
              <X className="w-6 h-6 text-white" />
            </Button>
            
            {/* 放大/缩小按钮 */}
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 bg-white/20 hover:bg-white/40 z-50 h-10 w-10 border-white rounded-full"
              onClick={handleToggleZoom}
            >
              {isZoomed ? (
                <Image className="w-6 h-6 text-white" />
              ) : (
                <Maximize className="w-6 h-6 text-white" />
              )}
            </Button>
            
            {/* 缩放提示 */}
            <div className="fixed bottom-4 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full z-50">
              {isZoomed ? "点击图片或按钮可缩小，滚动可查看更多细节" : "点击图片可放大查看细节"}
            </div>
            
            {isZoomed ? (
              <div 
                className="cursor-zoom-out w-full"
                onClick={handleToggleZoom}
              >
                <img 
                  src={previewImage} 
                  alt="预览图片" 
                  className="w-full"
                  style={{ maxWidth: '50%', margin: '0 auto' }}
                />
              </div>
            ) : (
              <div 
                className="cursor-zoom-in flex items-center justify-center h-[calc(100vh-8rem)] p-4"
                onClick={handleToggleZoom}
              >
                <img 
                  src={previewImage} 
                  alt="预览图片" 
                  className="max-w-[95%] max-h-[95vh] object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 