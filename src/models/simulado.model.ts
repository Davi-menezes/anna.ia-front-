
export interface Simulado {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}
