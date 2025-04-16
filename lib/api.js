// lib/api.js
// DeepSeek API调用函数

/**
 * 调用DeepSeek API进行文章总结
 * @param {string} content - 要总结的文章内容
 * @param {string} prompt - 用于指导总结的提示词
 * @returns {Promise<string>} - 返回总结结果
 */
export async function summarizeWithDeepSeek(content, prompt) {
    try {
      // 从环境变量获取API密钥
      const apiKey = process.env.DEEPSEEK_API_KEY;
      const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
  
      if (!apiKey) {
        throw new Error('DeepSeek API密钥未配置');
      }
  
      // 准备请求数据
      const requestData = {
        model: "deepseek-chat", // 使用的模型，根据DeepSeek的具体要求调整
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
        temperature: 0.7, // 可以根据需要调整这些参数
        max_tokens: 2000,
      };
  
      // 发送请求到DeepSeek API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API请求失败: ${errorData.error?.message || response.statusText}`);
      }
  
      const data = await response.json();
      // 根据DeepSeek API的返回格式提取总结内容
      return data.choices[0].message.content;
    } catch (error) {
      console.error('总结API调用失败:', error);
      throw error;
    }
  }