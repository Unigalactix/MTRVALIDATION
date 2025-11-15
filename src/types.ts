import type { ReactNode } from 'react';

export enum MessageAuthor {
  USER = 'user',
  GEMINI = 'gemini',
  TOOL = 'tool',
}

export interface Message {
  id: string;
  author: MessageAuthor;
  content: ReactNode;
}
