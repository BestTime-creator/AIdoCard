import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, PenLine, Save, Image, Share2 } from "lucide-react";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2">帮助与支持</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            我们随时准备为您解答疑问并提供帮助
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">常见问题</CardTitle>
              <CardDescription>我们整理了一些用户常见的问题</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-6">
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">如何使用AI总结卡片？</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  只需将您想要总结的文章粘贴到输入框中，点击"生成卡片"按钮，
                  系统会自动分析文章内容并生成精美的总结卡片。您可以下载、分享或保存这些卡片。
                </p>
              </div>
              
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">支持哪些语言的文章？</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  目前我们支持中文和英文文章的总结。未来我们计划扩展到更多语言。
                </p>
              </div>
              
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">如何提高总结的准确性？</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  为获得最佳结果，请确保输入的文章内容完整、清晰。文章长度建议在500-5000字之间，
                  这样可以保证AI有足够的信息进行分析，同时不会因信息过多而导致重点模糊。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">如何修改HTML文件</CardTitle>
              <CardDescription>按照以下步骤自定义您的HTML总结内容</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="flex flex-col items-center text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center mb-2">
                    <span className="text-purple-800 dark:text-purple-200 font-medium">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">下载HTML文件</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    在个人中心点击您需要修改的总结卡片下方的"下载HTML"按钮
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <PenLine className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2">
                    <span className="text-blue-800 dark:text-blue-200 font-medium">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">编辑HTML</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    使用记事本或代码编辑器打开HTML文件，找到并修改您要编辑的文字内容
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                    <Save className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="w-8 h-8 bg-pink-200 dark:bg-pink-800 rounded-full flex items-center justify-center mb-2">
                    <span className="text-pink-800 dark:text-pink-200 font-medium">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">保存文件</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    完成编辑后保存文件，确保保留.html后缀名
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                    <Share2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="w-8 h-8 bg-indigo-200 dark:bg-indigo-800 rounded-full flex items-center justify-center mb-2">
                    <span className="text-indigo-800 dark:text-indigo-200 font-medium">4</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">查看与分享</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    用浏览器打开保存后的HTML文件预览效果，可以截图保存并分享
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="m-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                即将上线
              </Badge>
            </div>
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">新功能预告</CardTitle>
              <CardDescription>我们正在开发更多实用功能</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="flex items-start gap-6 mt-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-amber-600 dark:text-amber-400 mb-2">HTML转图片功能</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    我们即将推出HTML一键转图片功能，让您可以直接将修改后的HTML文件转换为高质量图片，
                    无需截图，方便分享到各种社交平台和即时通讯工具。敬请期待！
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-full">一键转换</span>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-full">便捷分享</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 