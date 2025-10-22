export interface Prompt {
  id: string;
  title: string;
  description: string;
  prompt_text: string;
  model: string;
  tags: string[];
  author_id: string;
  created_at: string;
  updated_at?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reported_count?: number;
}