'use client';

import { useEffect, useState, useMemo } from 'react';
import { Prompt } from '@/types/prompt';
import { usePromptStore } from '@/store/usePromptStore';
import PromptList from '@/components/PromptList';
import SearchBar from '@/components/SearchBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SearchPage() {
  // 移除 useSearchParams 的使用，改为使用 useState 管理查询
  const [query, setQuery] = useState('');
  const { prompts, fetchPrompts, error, loading } = usePromptStore();
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // 使用 useMemo 优化过滤逻辑
  const computedFilteredPrompts = useMemo(() => {
    if (!query) return prompts;
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(query.toLowerCase()) ||
      prompt.description.toLowerCase().includes(query.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [prompts, query]);

  useEffect(() => {
    setFilteredPrompts(computedFilteredPrompts);
  }, [computedFilteredPrompts]);

  const handleSearch = (newQuery: string) => {
    // In a real app, you would navigate to search page with new query
    // For now, we'll just filter the existing prompts
    setQuery(newQuery);
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
      
      <main className="flex-grow container mx-auto px-4 py-8 relative z-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {query ? `Search Results for "${query}"` : 'Search Prompts'}
          </h1>
        </div>
        
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>
        
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No prompts found</p>
            <button 
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
              onClick={() => setFilteredPrompts(prompts)}
            >
              View all prompts
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6 text-center">
              Found {filteredPrompts.length} related prompts
            </p>
            <PromptList prompts={filteredPrompts} />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}