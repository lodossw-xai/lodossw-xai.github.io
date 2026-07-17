import { create } from 'zustand';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category: 'notice' | 'qna';
}

interface BoardState {
  posts: Post[];
  addPost: (title: string, content: string, author: string, category: 'notice' | 'qna') => void;
  deletePost: (id: string) => void;
}

// 초기 샘플 데이터 정의
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    title: 'XAI Korea 공식 블로그 및 뉴스 게시판 오픈',
    content: '안녕하세요. 설명 가능한 인공지능(XAI) 기술로 한국의 세무·법률 시장을 혁신하는 XAI Korea입니다. 앞으로 이 게시판을 통해 유용한 법률/세무 AI 동향 및 회사 소식을 전해드리겠습니다.',
    author: '운영자',
    createdAt: '2026-07-02 12:00',
    category: 'notice',
  },
  {
    id: '2',
    title: '2026년도 개정 세법 및 R&D 세액공제 AI 분석 리포트 배포',
    content: '개정 세법에 맞춘 신성장·원천기술 R&D 비용 인정 범위에 대한 종합 분석 보고서가 Hugging Face 및 공식 리포트 섹션에 업로드되었습니다. 많은 관심 부탁드립니다.',
    author: 'AI 분석팀',
    createdAt: '2026-07-01 15:30',
    category: 'notice',
  },
  {
    id: '3',
    title: 'AI 조세 환급 리포트 조회 시 오류가 발생합니다.',
    content: '특정 브라우저에서 조세 환급 리포트 PDF 다운로드 버튼을 눌렀을 때 반응이 없습니다. 해결 방법이 있을까요?',
    author: '사용자A',
    createdAt: '2026-07-02 10:15',
    category: 'qna',
  }
];

export const useBoardStore = create<BoardState>((set) => ({
  posts: (() => {
    const saved = localStorage.getItem('xaikorea_board_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  })(),
  addPost: (title, content, author, category) => set((state) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      author,
      createdAt: new Date().toLocaleString('ko-KR', { hour12: false }).substring(0, 16),
      category,
    };
    const updated = [newPost, ...state.posts];
    localStorage.setItem('xaikorea_board_posts', JSON.stringify(updated));
    return { posts: updated };
  }),
  deletePost: (id) => set((state) => {
    const updated = state.posts.filter((post) => post.id !== id);
    localStorage.setItem('xaikorea_board_posts', JSON.stringify(updated));
    return { posts: updated };
  }),
}));
