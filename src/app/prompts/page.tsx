'use client';

import { useEffect } from 'react';
import { Prompt } from '@/types/prompt';
import { usePromptStore } from '@/store/usePromptStore';
import PromptList from '@/components/PromptList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PromptsPage() {
  const { prompts, fetchPrompts, loading, error } = usePromptStore();

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

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
          <h1 className="text-4xl font-bold">
            All Prompts
          </h1>
        </div>
        
        <PromptList prompts={prompts} />
      </main>
      
      <Footer />
    </div>
  );
}