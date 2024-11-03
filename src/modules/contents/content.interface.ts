import { Comments, Ratings, Genres } from '@prisma/client';

export interface Contents {
  uuid: string;
  title: string;
  thumbnail: string;
  description: string;
  subjects: string[];
  created_at: Date;
  updated_at: Date;
  category_id?: number;
  genres: Genres[];
  comments: Comments[];
  ratings: Ratings[];
}
