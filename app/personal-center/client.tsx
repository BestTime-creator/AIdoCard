"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Maximize, X, History, User } from "lucide-react";
import { User as SupabaseUser } from '@supabase/supabase-js';

interface PersonalCenterClientProps {
  user: SupabaseUser;
}

export default function PersonalCenterClient({ user }: PersonalCenterClientProps) {
  const [points, setPoints] = useState(5); // 默认5个点数
  const [generatedImages, setGeneratedImages] = useState<string[]>([
    '/images/vertical-card-1.png',
    '/images/vertical-card-2.png',
    '/images/horizontal-card-1.png',
  ]); // 示例数据
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 充值点数功能
  const handleRecharge = () => {
    // 实际应用中会跳转到支付页面或打开支付弹窗
    alert('跳转到充值页面');
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

  return (
    <div className="container mx-auto px-4 py-4 max-w-5xl">
      {/* 用户信息与点数显示 */}
      <div className="mb-8">
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <h2 className="text-2xl font-bold">个人中心</h2>
              <p className="text-gray-600 dark:text-gray-300">
                欢迎回来，{user?.email || '用户'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <User className="w-5 h-5 text-purple-600" />
                <p>账户ID: {user?.id?.substring(0, 8) || 'N/A'}...</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">剩余点数:</span>
                <span className="text-3xl font-bold text-purple-600">{points}</span>
              </div>
              <Button 
                onClick={handleRecharge}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                充值点数
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 历史生成图片 */}
      <div className="mb-8">
        <Card className="p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">历史生成记录</h2>
          </div>

          {generatedImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`生成的总结卡片 ${index + 1}`}
                    className="w-full h-[200px] object-cover object-top transition-transform group-hover:scale-[1.02] rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                  <Button
                    variant="secondary"
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                    onClick={() => handleOpenPreview(image)}
                  >
                    <Maximize className="w-4 h-4 mr-1" />
                    查看
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <History className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">暂无生成记录</h3>
              <p className="text-gray-500 text-center mb-4">
                您还没有生成任何总结卡片
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg"
                onClick={() => window.location.href = '/'}
              >
                去生成卡片
              </Button>
            </div>
          )}
        </Card>
      </div>

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
              className="w-auto h-auto mb-8"
              style={{ 
                maxWidth: isHorizontalCard(previewImage) ? '80%' : 'none',
                maxHeight: 'none'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 