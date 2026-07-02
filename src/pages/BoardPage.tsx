import type { ReactElement } from 'react';
import { useState } from 'react';
import Toast from '../components/common/Toast';
import Footer from '../components/layout/Footer';
import Navigation from '../components/layout/Navigation';
import { useBoardStore } from '../store/useBoardStore';

function BoardPage(): ReactElement {
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

  const { posts, addPost, deletePost } = useBoardStore();
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'write'>('list');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'notice' | 'qna'>('all');

  // 글쓰기 Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'notice' | 'qna'>('notice');

  // 알림 토스트 State
  const [toast, setToast] = useState({ isOpen: false, message: '' });

  const showToast = (message: string) => setToast({ isOpen: true, message });

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  // 카테고리 탭 및 검색어 필터링
  const filteredPosts = posts.filter((p) => {
    const matchesTab = activeTab === 'all' || p.category === activeTab;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !content.trim()) {
      showToast('모든 빈칸을 채워주세요.');
      return;
    }
    addPost(title, content, author, category);
    setTitle('');
    setAuthor('');
    setContent('');
    setCategory('notice');
    setViewMode('list');
    showToast('글이 성공적으로 등록되었습니다.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      deletePost(id);
      setViewMode('list');
      showToast('게시글이 삭제되었습니다.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1120] text-gray-900 dark:text-gray-100">
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleDarkModeToggle} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header Title */}
        <div className="mb-12 text-center">
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-ai-blue to-ai-green">
            XAI Korea Board
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            세무·법률 AI의 최신 동향과 XAI Korea의 새로운 소식을 만나보세요.
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
                전체보기
              </button>
              <button
                onClick={() => setActiveTab('notice')}
                className={`py-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  activeTab === 'notice'
                    ? 'border-ai-blue text-ai-blue'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                공지사항
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
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-ai-blue/50 focus:border-ai-blue transition"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
              </div>

              {/* Write Button */}
              <button
                onClick={() => setViewMode('write')}
                className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                글쓰기
              </button>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-gray-100 dark:border-slate-800/80">
                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-700 mb-4 block">
                  feed
                </span>
                <p className="text-gray-500 dark:text-gray-400">게시글이 존재하지 않습니다.</p>
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
                          {post.category === 'notice' ? '공지사항' : 'Q&A'}
                        </span>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-ai-blue transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {post.createdAt}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                      {post.content}
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
                  {selectedPost.category === 'notice' ? '공지사항' : 'Q&A'}
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
                <span>{selectedPost.createdAt}</span>
              </div>
            </div>

            <div className="text-gray-700 dark:text-gray-300 leading-relaxed min-h-[250px] whitespace-pre-wrap keep-all mb-8">
              {selectedPost.content}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-800/80 pt-6">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition cursor-pointer"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                목록으로
              </button>
              <button
                onClick={() => handleDelete(selectedPost.id)}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                삭제하기
              </button>
            </div>
          </div>
        )}

        {/* 3. WRITE VIEW */}
        {viewMode === 'write' && (
          <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
            <h2 className="font-bold text-2xl text-gray-900 dark:text-white mb-6">게시글 작성</h2>
            <form onSubmit={handleWriteSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  카테고리
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900/40 px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium flex-1 justify-center transition hover:border-ai-blue/40">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'notice'}
                      onChange={() => setCategory('notice')}
                      className="text-ai-blue focus:ring-ai-blue"
                    />
                    <span>공지사항</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900/40 px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium flex-1 justify-center transition hover:border-ai-blue/40">
                    <input
                      type="radio"
                      name="category"
                      checked={category === 'qna'}
                      onChange={() => setCategory('qna')}
                      className="text-ai-blue focus:ring-ai-blue"
                    />
                    <span>Q&A</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-ai-blue/50 focus:border-ai-blue transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  작성자
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-ai-blue/50 focus:border-ai-blue transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="내용을 입력하세요"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-ai-blue/50 focus:border-ai-blue transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="py-3 px-6 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="py-3 px-8 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default BoardPage;
