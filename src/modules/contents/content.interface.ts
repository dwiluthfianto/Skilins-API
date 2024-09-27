import { Comments, Likes, Tags } from '@prisma/client';

export interface Contents {
  id: number | string;
  uuid?: string;
  title: string;
  thumbnail: string;
  description: string;
  subjects: string[];
  created_at: Date;
  updated_at: Date;
  category_id?: number;
  tags: Tags[];
  comments: Comments[];
  likes: Likes[];
}
