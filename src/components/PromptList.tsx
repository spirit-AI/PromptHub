'use client';

import { Prompt } from '@/types/prompt';
import PromptCard from './cards/PromptCard';
import { memo } from 'react';

interface PromptListProps {
  prompts: Prompt[];
}

// 自定义比较函数，只在提示词数组实际变化时重新渲染
const areEqual = (prevProps: PromptListProps, nextProps: PromptListProps) => {
  return (
    prevProps.prompts.length === nextProps.prompts.length &&
    prevProps.prompts.every((prompt, index) => 
      prompt.id === nextProps.prompts[index].id &&
      prompt.title === nextProps.prompts[index].title &&
      prompt.description === nextProps.prompts[index].description &&
      prompt.model === nextProps.prompts[index].model &&
      JSON.stringify(prompt.tags) === JSON.stringify(nextProps.prompts[index].tags) &&
      prompt.created_at === nextProps.prompts[index].created_at
    )
  );
};

// 使用 memo 优化组件性能，并提供自定义比较函数
const PromptList = memo(({ prompts }: PromptListProps) => {
  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No prompts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map(prompt => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}, areEqual);

PromptList.displayName = 'PromptList';

export default PromptList;