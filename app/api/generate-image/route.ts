import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { htmlContent, width = 800, height = 600, cssStyles = '' } = await request.json();

    // 添加基础样式和传入的自定义样式
    const htmlWithStyles = `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf5 100%);
              color: #333;
            }
            h1, h2, h3 {
              color: #6d28d9;
            }
            p {
              line-height: 1.6;
            }
            ul, ol {
              padding-left: 20px;
            }
            ${cssStyles}
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: true, // 修复headless参数类型
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewport({ width, height });
    
    // 设置HTML内容
    await page.setContent(htmlWithStyles, { 
      waitUntil: 'networkidle0' 
    });
    
    // 等待内容完全渲染
    await page.evaluateHandle('document.fonts.ready');
    
    // 计算实际内容高度以便生成完整截图
    const bodyHeight = await page.evaluate(() => {
      return document.body.scrollHeight;
    });
    
    // 调整视口高度以匹配内容
    await page.setViewport({ width, height: bodyHeight });
    
    // 生成截图，使用透明背景
    const screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: true,
      omitBackground: true // 启用透明背景
    });
    
    await browser.close();
    
    // 返回图片作为下载内容
    return new NextResponse(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="article-summary.png"'
      }
    });
  } catch (error: any) {
    console.error('生成图片时出错:', error);
    return NextResponse.json({ error: '生成图片失败', message: error.message }, { status: 500 });
  }
} 