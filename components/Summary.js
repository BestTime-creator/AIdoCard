// components/Summary.js
import { useRef } from 'react';

export default function Summary({ summary, isLoading }) {
  const summaryRef = useRef(null);

  // 复制总结内容到剪贴板
  const copyToClipboard = () => {
    if (summaryRef.current) {
      navigator.clipboard.writeText(summary)
        .then(() => {
          alert('总结已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          alert('复制失败，请手动选择并复制');
        });
    }
  };

  // 如果没有总结内容，不显示此组件
  if (!summary && !isLoading) {
    return null;
  }

  return (
    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          文章总结结果
        </h3>
        {summary && (
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            复制总结
          </button>
        )}
      </div>
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <span className="ml-2 text-gray-500">正在生成总结，请耐心等候...</span>
            </div>
          ) : (
            <div 
              ref={summaryRef}
              className="prose max-w-none"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}