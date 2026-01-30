export interface Flashcard {
  id: string;
  subject?: string;
  front: string;
  back: string;
  status: 'new' | 'learning' | 'review';
  lastReviewedAt?: string;
  nextReviewAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
