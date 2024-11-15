export interface BookType {
  id: string;
  title: string;
  author: string;
  content_url: string;
  cover_image: string;
  created_at: string;
  updated_at: string;
  type: string;
  content?: string;
  file?: File;
  content_category?: string;
}

export interface UserProfile {
  name: string;
  email: string;
}
