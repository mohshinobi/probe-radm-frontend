export interface MistralMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MistralRequest {
  model: string;
  messages: MistralMessage[];
}

export interface MistralChoice {
  message: MistralMessage;
  finish_reason: string;
  index: number;
}

export interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: MistralChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Réponse transformée pour notre application
export interface AnalysisResponse {
  content: string;
  error?: string;
}
