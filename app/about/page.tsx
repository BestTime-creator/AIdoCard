import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2">关于我们</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            了解AI总结卡片背后的理念与技术
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">我们的使命</CardTitle>
              <CardDescription>帮助用户更高效地处理信息</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <p className="leading-7 text-gray-700 dark:text-gray-300">
                AI总结卡片致力于利用先进的人工智能技术，帮助用户快速提取文章中的关键信息，
                生成简洁明了的总结卡片。我们的目标是在信息爆炸的时代，为用户节省宝贵的时间，
                提高阅读效率，帮助用户更好地管理和利用知识。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">技术优势</CardTitle>
              <CardDescription>基于最新AI技术</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <p className="leading-7 text-gray-700 dark:text-gray-300">
                我们采用先进的自然语言处理技术，能够智能识别文章的核心观点和关键信息，
                生成准确、简洁的总结。通过持续优化算法，我们的系统不断学习和进步，
                提供越来越智能的文章分析和总结服务。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl text-blue-600 dark:text-blue-400">产品特色</CardTitle>
              <CardDescription>简洁高效的知识处理工具</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <p className="leading-7 text-gray-700 dark:text-gray-300">
                AI总结卡片提供直观美观的图文结合展示方式，支持一键分享到各大社交平台。
                我们支持横版竖版卡片样式，满足不同场景需求，帮助用户更好地消化和传播知识。
                无论是学习笔记、文章摘要还是重要观点整理，AI总结卡片都能提供出色的视觉呈现效果。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">智能分析</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">美观设计</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">一键分享</span>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">多种样式</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 