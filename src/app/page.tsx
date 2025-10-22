'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import { Prompt } from '@/types/prompt';
import { usePromptStore } from '@/store/usePromptStore';
import PromptList from '@/components/PromptList';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CATEGORIES, TAG_COLORS } from '@/lib/constants';

// 创建一个独立的标签组件来优化渲染
const TagButton = memo(({ 
  tag, 
  index,
  isActive,
  onClick,
  colorClass
}: {
  tag: string;
  index?: number;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
}) => (
  <span
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer ${
      isActive ? 'shadow-md transform scale-105' : ''
    } ${colorClass}`}
    onClick={onClick}
  >
    {index !== undefined && (
      <span className="font-bold mr-1">#{index + 1}</span>
    )}
    {tag}
  </span>
));

TagButton.displayName = 'TagButton';

// 创建独立的分类按钮组件
const CategoryButton = memo(({ 
  category,
  isSelected,
  onClick,
  colorClass
}: {
  category: string;
  isSelected: boolean;
  onClick: () => void;
  colorClass: string;
}) => (
  <button
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      isSelected
        ? 'shadow-md transform scale-105'
        : 'hover:bg-gray-300'
    } ${colorClass}`}
    onClick={onClick}
  >
    {category}
  </button>
));

CategoryButton.displayName = 'CategoryButton';

// 创建独立的Tab按钮组件
const TabButton = memo(({ 
  activeTab,
  tab,
  label,
  onClick
}: {
  activeTab: string;
  tab: string;
  label: string;
  onClick: () => void;
}) => (
  <button 
    className={`px-4 py-2 rounded-lg ${activeTab === tab ? 'bg-primary-500 text-white' : 'bg-gray-200'}`}
    onClick={onClick}
  >
    {label}
  </button>
));

TabButton.displayName = 'TabButton';

export default function Home() {
  const { prompts, fetchPrompts, loading, error } = usePromptStore();
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'categories'>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // 获取热门标签 - 使用 useMemo 优化性能
  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    
    prompts.forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    
    // 转换为数组并按计数排序
    const sortedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // 只取前10个
      .map(([tag]) => tag);
    
    return sortedTags;
  }, [prompts]);

  // 使用 useMemo 优化过滤后的提示词计算
  const computedFilteredPrompts = useMemo(() => {
    // 根据活动标签过滤提示词
    let result = [...prompts];
    
    if (activeTab === 'popular') {
      // 按照标签频率排序来模拟热门
      result.sort((a, b) => {
        // 计算每个提示词的标签在热门标签中的权重
        const aWeight = a.tags ? a.tags.reduce((sum, tag) => 
          sum + (popularTags.indexOf(tag) !== -1 ? popularTags.length - popularTags.indexOf(tag) : 0), 0) : 0;
        const bWeight = b.tags ? b.tags.reduce((sum, tag) => 
          sum + (popularTags.indexOf(tag) !== -1 ? popularTags.length - popularTags.indexOf(tag) : 0), 0) : 0;
        return bWeight - aWeight;
      });
    } else if (activeTab === 'categories' && selectedCategory) {
      // 按分类过滤
      result = result.filter(prompt => 
        prompt.tags && prompt.tags.includes(selectedCategory)
      );
    }
    
    return result;
  }, [prompts, activeTab, selectedCategory, popularTags]);

  useEffect(() => {
    setFilteredPrompts(computedFilteredPrompts);
  }, [computedFilteredPrompts]);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredPrompts(computedFilteredPrompts);
      return;
    }
    
    const filtered = computedFilteredPrompts.filter((prompt: Prompt) => 
      prompt.title.toLowerCase().includes(query.toLowerCase()) ||
      prompt.description.toLowerCase().includes(query.toLowerCase()) ||
      prompt.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredPrompts(filtered);
  };

  if (loading && prompts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            Loading...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && prompts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            Error: {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Discover the Best AI Prompts
        </h1>
        
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <TabButton 
              activeTab={activeTab} 
              tab="latest" 
              label="Latest" 
              onClick={() => {
                setActiveTab('latest');
                setSelectedCategory(null);
              }} 
            />
            <TabButton 
              activeTab={activeTab} 
              tab="popular" 
              label="Popular" 
              onClick={() => {
                setActiveTab('popular');
                setSelectedCategory(null);
              }} 
            />
            <TabButton 
              activeTab={activeTab} 
              tab="categories" 
              label="Categories" 
              onClick={() => setActiveTab('categories')} 
            />
          </div>
        </div>
        
        {activeTab === 'popular' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Popular Tags</h2>
            <div className="flex flex-wrap gap-3">
              {popularTags.map((tag, index) => (
                <TagButton
                  key={tag}
                  tag={tag}
                  index={index}
                  isActive={false}
                  onClick={() => {}}
                  colorClass={TAG_COLORS[tag] || 'bg-gray-200 text-gray-800'}
                />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'categories' ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {CATEGORIES.map(category => (
                <CategoryButton
                  key={category}
                  category={category}
                  isSelected={selectedCategory === category}
                  onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                  colorClass={TAG_COLORS[category] || 'bg-gray-200 text-gray-800'}
                />
              ))}
            </div>
            
            {selectedCategory && (
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-4">
                  Category: {selectedCategory}
                </h2>
              </div>
            )}
          </div>
        ) : null}
        
        <PromptList prompts={filteredPrompts} />
      </main>
      
      <Footer />
    </div>
  );
}