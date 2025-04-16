// components/SummaryForm.js
import { useState } from 'react';

export default function SummaryForm({ onSubmit, isLoading }) {
  const [content, setContent] = useState('');
  const [summaryType, setSummaryType] = useState('standard');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ content, summaryType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          输入要总结的文章内容
        </label>
        <textarea
          id="content"
          name="content"
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="在这里粘贴或输入文章内容..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          选择总结类型
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="summaryType"
              value="standard"
              checked={summaryType === 'standard'}
              onChange={() => setSummaryType('standard')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2">标准总结</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="summaryType"
              value="bullet"
              checked={summaryType === 'bullet'}
              onChange={() => setSummaryType('bullet')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2">要点总结</span>
          </label>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? '总结中...' : '生成总结'}
        </button>
      </div>
    </form>
  );
}