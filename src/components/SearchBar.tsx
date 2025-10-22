'use client';

import { useState, memo } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

// 使用 memo 优化组件性能
const SearchBar = memo(({ initialQuery = '', onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search prompts, tags, or models..."
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      <button 
        type="submit"
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary-500"
      >
        <span className="sr-only">Search</span>
      </button>
    </form>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;