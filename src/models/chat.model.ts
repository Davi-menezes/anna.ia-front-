
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  imageUrl?: string; // data URL exibida na bolha do usuário
}

