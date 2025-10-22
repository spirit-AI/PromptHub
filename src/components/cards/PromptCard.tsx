'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types/prompt';
import { Copy, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptCardProps {
  prompt: Prompt;
}

// 自定义比较函数，只比较必要的props
const areEqual = (prevProps: PromptCardProps, nextProps: PromptCardProps) => {
  return (
    prevProps.prompt.id === nextProps.prompt.id &&
    prevProps.prompt.title === nextProps.prompt.title &&
    prevProps.prompt.description === nextProps.prompt.description &&
    prevProps.prompt.model === nextProps.prompt.model &&
    JSON.stringify(prevProps.prompt.tags) === JSON.stringify(nextProps.prompt.tags) &&
    prevProps.prompt.created_at === nextProps.prompt.created_at
  );
};

// 使用 memo 优化组件性能，并提供自定义比较函数
export default memo(function PromptCard({ prompt }: PromptCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = () => {
    setFavorited(!favorited);
    // TODO: Implement favorite functionality
  };

  const handleViewDetails = () => {
    router.push(`/prompt/${prompt.id}`);
  };

  return (
    <div className="border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 
          className="font-semibold text-lg cursor-pointer hover:text-primary-500 transition line-clamp-2"
          onClick={handleViewDetails}
        >
          {prompt.title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavorite}
          className="p-1 h-auto"
        >
          <Heart 
            className={`w-4 h-4 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </Button>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {prompt.description}
      </p>
      
      <div className="flex flex-wrap gap-1 mb-4">
        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
          {prompt.model}
        </span>
        {prompt.tags && prompt.tags.slice(0, 3).map((tag, index) => (
          <span 
            key={index} 
            className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
          >
            {tag}
          </span>
        ))}
        {prompt.tags && prompt.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
            +{prompt.tags.length - 3}
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {new Date(prompt.created_at).toLocaleDateString()}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button 
            size="sm"
            onClick={handleViewDetails}
            className="text-xs bg-primary-500 hover:bg-primary-600"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}, areEqual);