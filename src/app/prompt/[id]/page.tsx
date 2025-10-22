'use client';

import React, { useEffect, useState, useRef, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Prompt } from '@/types/prompt';
import { usePromptStore } from '@/store/usePromptStore';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Copy, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { MODELS } from '@/lib/constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 创建独立的RelatedPromptCard组件
const RelatedPromptCard = memo(({ 
  prompt,
  onClick
}: {
  prompt: Prompt;
  onClick: () => void;
}) => (
  <div 
    className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
    onClick={onClick}
  >
    <h3 className="font-semibold mb-2">{prompt.title}</h3>
    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{prompt.description}</p>
    <div className="flex flex-wrap gap-1">
      {prompt.tags && prompt.tags.slice(0, 3).map((tag, index) => (
        <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
          {tag}
        </span>
      ))}
    </div>
  </div>
));

RelatedPromptCard.displayName = 'RelatedPromptCard';

// 创建独立的CommentItem组件
const CommentItem = memo(({ 
  comment,
  onLike,
  onDelete,
  canDelete
}: {
  comment: any;
  onLike: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) => (
  <div key={comment.id} className="bg-white rounded-xl shadow-md p-6">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
          <span className="font-medium text-primary-600">
            {comment.author?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <h4 className="font-semibold">{comment.author || 'Anonymous'}</h4>
          <p className="text-sm text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* 删除按钮 - 仅对管理员或评论作者可见 */}
      {canDelete && (
        <button 
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Delete comment"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
    <p className="text-gray-700">{comment.content}</p>
    <div className="flex items-center mt-3 space-x-4">
      <button 
        onClick={onLike}
        className="flex items-center text-gray-500 hover:text-red-500"
      >
        <Heart className="w-4 h-4 mr-1" />
        <span>Like</span>
      </button>
    </div>
  </div>
));

CommentItem.displayName = 'CommentItem';

export default function PromptDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { prompts, fetchPrompts } = usePromptStore();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [relatedPrompts, setRelatedPrompts] = useState<Prompt[]>([]);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // 使用React.use()解包params Promise
  const unwrappedParams = React.use(params);
  const promptId = unwrappedParams.id;

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  useEffect(() => {
    if (prompts.length > 0 && promptId) {
      const foundPrompt = prompts.find(p => p.id === promptId);
      if (foundPrompt) {
        setPrompt(foundPrompt);
        // 初始化点赞数，由于Prompt类型中没有likes属性，我们使用默认值0
        setLikeCount(0);
        
        // Find related prompts by tags
        const related = prompts.filter(p => 
          p.id !== foundPrompt.id && 
          p.tags && foundPrompt.tags &&  // 添加检查
          p.tags.some(tag => foundPrompt.tags.includes(tag))
        ).slice(0, 3);
        
        setRelatedPrompts(related);
      } else {
        // Handle not found
        router.push('/404');
      }
    }
  }, [prompts, promptId, router]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavorite = () => {
    if (prompt) {
      // 切换收藏状态
      const newFavorited = !favorited;
      setFavorited(newFavorited);
      
      // 这里应该调用API来更新收藏状态，暂时只在前端更新
      console.log(`Prompt ${prompt.id} favorited: ${newFavorited}`);
      
      // 可以在这里添加通知或提示
      if (newFavorited) {
        // 收藏成功提示
        console.log('Favorite added');
      } else {
        // 取消收藏提示
        console.log('Favorite removed');
      }
    }
  };

  const handleLike = () => {
    if (prompt) {
      // 切换点赞状态
      const newLiked = !liked;
      setLiked(newLiked);
      
      // 更新点赞数
      const newLikeCount = newLiked ? likeCount + 1 : likeCount - 1;
      setLikeCount(newLikeCount);
      
      // 这里应该调用API来更新点赞数，暂时只在前端更新
      console.log(`Prompt ${prompt.id} liked: ${newLiked}, new count: ${newLikeCount}`);
    }
  };

  const handleComment = () => {
    // 跳转到评论区域或打开评论框
    console.log('Comment on prompt');
    // 滚动到页面底部或评论区域
    const commentSection = document.getElementById('comment-section');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
      // 聚焦到评论输入框
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }
  };

  const handlePostComment = () => {
    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    // 创建新评论对象
    const newComment = {
      id: Date.now().toString(),
      content: comment,
      author: user?.username || 'Anonymous',
      authorId: user?.id || '',
      createdAt: new Date().toISOString(),
      likes: 0
    };

    // 更新评论列表
    setComments([...comments, newComment]);
    
    // 清空输入框
    setComment('');
    
    console.log('Comment posted:', newComment);
  };

  const handleCommentLike = (commentId: string) => {
    // 这里应该调用API来更新评论点赞数，暂时只在前端更新
    console.log(`Comment ${commentId} liked`);
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      // 过滤掉要删除的评论
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
      console.log(`Comment ${commentId} deleted`);
    }
  };

  // 检查用户是否有权限删除评论（管理员或评论作者）
  const canDeleteComment = (commentAuthorId: string) => {
    if (!user) return false;
    // 用户是管理员或评论作者
    return user.role === 'admin' || user.id === commentAuthorId;
  };

  // 获取模型显示名称的函数
  const getModelDisplayName = (modelId: string) => {
    const model = MODELS.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  if (!prompt) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => router.back()} 
              className="text-primary-500 hover:underline"
            >
              ← Back
            </button>
            <a 
              href="/upload" 
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm"
            >
              Upload Prompt
            </a>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{prompt.title}</h1>
              <div className="flex space-x-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button 
                  onClick={handleFavorite}
                  className={`flex items-center px-4 py-2 rounded-lg transition ${
                    favorited 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${favorited ? 'fill-current' : ''}`} />
                  {favorited ? 'Favorited' : 'Favorite'}
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                {getModelDisplayName(prompt.model)}
              </span>
              {prompt.tags && prompt.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{prompt.description}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Prompt Content</h2>
              <div className="bg-gray-50 p-4 rounded-lg border prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {prompt.prompt_text}
                </ReactMarkdown>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLike}
                  className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-500 hover:text-primary-500'}`}
                >
                  <Heart className={`w-5 h-5 mr-1 ${liked ? 'fill-current' : ''}`} />
                  <span>Like ({likeCount})</span>
                </button>
                <button 
                  onClick={handleComment}
                  className="flex items-center text-gray-500 hover:text-primary-500"
                >
                  <MessageCircle className="w-5 h-5 mr-1" />
                  <span>Comment</span>
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Created on {new Date(prompt.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {relatedPrompts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Prompts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPrompts.map(relatedPrompt => (
                  <RelatedPromptCard
                    key={relatedPrompt.id}
                    prompt={relatedPrompt}
                    onClick={() => router.push(`/prompt/${relatedPrompt.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 评论区域 */}
          <div id="comment-section" className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-4">
                <textarea 
                  ref={commentInputRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  placeholder="Write your comment..."
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handlePostComment}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post Comment
                </button>
              </div>
            </div>
            
            {/* 评论列表 */}
            <div className="mt-8 space-y-6">
              {comments.length > 0 ? (
                comments.map((commentItem) => (
                  <CommentItem
                    key={commentItem.id}
                    comment={commentItem}
                    onLike={() => handleCommentLike(commentItem.id)}
                    onDelete={() => handleDeleteComment(commentItem.id)}
                    canDelete={canDeleteComment(commentItem.authorId)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}