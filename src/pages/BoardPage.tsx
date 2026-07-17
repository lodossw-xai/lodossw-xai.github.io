import type { ReactElement } from 'react';
import { useState, useMemo } from 'react';
import Footer from '../components/layout/Footer';
import Navigation from '../components/layout/Navigation';
import useLanguageStore from '../store/languageStore';
import { parseMarkdown } from '../utils/markdownParser';

// Vite Glob Import to read all markdown files in src/content/notices
const markdownFiles = import.meta.glob('/src/content/notices/*.md', {
  query: '?raw',
  eager: true,
}) as Record<string, { default: string }>;

function BoardPage(): ReactElement {
  const { language } = useLanguageStore();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const handleDarkModeToggle = (): void => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  // Parse all markdown files at runtime
  const posts = useMemo(() => {
    return Object.entries(markdownFiles).map(([filePath, fileModule]) => {
      const fileContent = fileModule.default;
      return parseMarkdown(filePath, fileContent);
    }).sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending
  }, []);

  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'notice' | 'qna'>('all');

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  // Filter posts by category tab and search query
  const filteredPosts = posts.filter((p) => {
    const matchesTab = activeTab === 'all' || p.category === activeTab;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.rawContent.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1120] text-gray-900 dark:text-gray-100">
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleDarkModeToggle} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header Title */}
        <div className="mb-12 text-center">
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-ai-blue to-ai-green">
            {language === 'ko' ? 'XAI Korea 게시판' : 'XAI Korea Board'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'ko'
              ? '세무·법률 AI의 최신 동향과 XAI Korea의 새로운 소식을 만나보세요.'
              : 'Discover the latest trends in tax/legal AI and news from XAI Korea.'}
          </p>
        </div>

        {/* 1. LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex border-b border-gray-100 dark:border-slate-800/80">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'border-ai-blue text-ai-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {language === 'ko' ? '전체보기' : 'Show All'}
              </button>
              <button
                onClick={() => setActiveTab('notice')}
                className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'notice'
                    ? 'border-ai-blue text-ai-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {language === 'ko' ? '공지사항' : 'Notices'}
              </button>
              <button
                onClick={() => setActiveTab('qna')}
                className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'qna'
                    ? 'border-ai-blue text-ai-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                Q&A
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={language === 'ko' ? '검색어를 입력하세요...' : 'Enter search terms...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-ai-blue/50 focus:border-ai-blue transition"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
              </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-gray-100 dark:border-slate-800/80">
                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-700 mb-4 block">
                  feed
                </span>
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'ko' ? '게시글이 존재하지 않습니다.' : 'No posts found.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPostId(post.id);
                      setViewMode('detail');
                    }}
                    className="p-6 bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl hover:border-ai-blue/40 hover:shadow-lg hover:shadow-blue-500/5 transition cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Category Badge */}
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                            post.category === 'notice'
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-ai-blue'
                              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-500'
                          }`}
                        >
                          {post.category === 'notice' ? (language === 'ko' ? '공지사항' : 'Notice') : 'Q&A'}
                        </span>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-ai-blue transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {post.date}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                      {post.rawContent}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="material-symbols-outlined text-[14px]">person</span>
                      <span>{post.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. DETAIL VIEW */}
        {viewMode === 'detail' && selectedPost && (
          <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-8 shadow-sm">
            <div className="border-b border-gray-100 dark:border-slate-800/80 pb-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    selectedPost.category === 'notice'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-ai-blue'
                      : 'bg-purple-50 dark:bg-purple-950/40 text-purple-500'
                  }`}
                >
                  {selectedPost.category === 'notice' ? (language === 'ko' ? '공지사항' : 'Notice') : 'Q&A'}
                </span>
                <h2 className="font-bold text-2xl lg:text-3xl text-gray-900 dark:text-white">
                  {selectedPost.title}
                </h2>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  {selectedPost.author}
                </span>
                <span>|</span>
                <span>{selectedPost.date}</span>
              </div>
            </div>

            {/* Markdown HTML Render Area */}
            <div
              className="prose prose-blue dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed min-h-[250px] mb-8 markdown-body"
              dangerouslySetInnerHTML={{ __html: selectedPost.contentHtml }}
            />

            <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800/80 pt-6">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition cursor-pointer"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                {language === 'ko' ? '목록으로' : 'Back to List'}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default BoardPage;
