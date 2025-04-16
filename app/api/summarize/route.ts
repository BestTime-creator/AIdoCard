import { NextResponse } from 'next/server';
import { summarizationPrompt, summarizationPrompt1080, bulletPointSummaryPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const { content, summaryType = 'vertical' } = await request.json();

    // 验证输入
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: '文章内容不能为空' },
        { status: 400 }
      );
    }

    // 根据用户选择的总结类型选择不同的提示词
    let prompt;
    switch (summaryType) {
      case 'bullet':
        prompt = bulletPointSummaryPrompt;
        break;
      case 'horizontal':
        prompt = summarizationPrompt1080;
        break;
      case 'vertical':
      case 'standard':
      default:
        prompt = summarizationPrompt;
        break;
    }

    // 调用DeepSeek API进行总结
    const summary = await summarizeWithDeepSeek(content, prompt);

    // 返回结果
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('总结处理失败:', error);
    return NextResponse.json(
      { error: '总结处理失败', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 调用DeepSeek API进行文章总结
 */
async function summarizeWithDeepSeek(content: string, prompt: string) {
  try {
    // 使用环境变量获取API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1/chat/completions';

    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    // 准备请求数据
    const requestData = {
      model: "deepseek-chat", // 使用的模型
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 8192, // 将最大token长度调整为API允许的最大值8192
    };

    // 记录请求数据长度
    const requestBody = JSON.stringify(requestData);
    const requestLength = requestBody.length;
    console.log(`API请求数据长度: ${requestLength} 字符`);

    // 发送请求到DeepSeek API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: requestBody
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API请求失败: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // 记录响应数据长度
    const responseLength = JSON.stringify(data).length;
    console.log(`API响应数据长度: ${responseLength} 字符`);
    console.log(`API响应内容长度: ${data.choices[0].message.content.length} 字符`);
    
    // 提取总结内容
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('总结API调用失败:', error);
    throw error;
  }
} 