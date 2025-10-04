export const MISTRAL_CONFIG = {
  API: {
    URL: 'https://api.mistral.ai/v1/chat/completions',
    MODEL: 'mistral-tiny',
  },
  QUESTIONS: {
    ALERT_MEANING: 'What does this alert mean?',
    IMPACT: 'What is the potential impact of this alert?',
    REMEDIATION: 'What would the possible means of remediation be?',
  },
} as const;

export type AuthorizedQuestion =
  (typeof MISTRAL_CONFIG.QUESTIONS)[keyof typeof MISTRAL_CONFIG.QUESTIONS];

export const AUTHORIZED_QUESTIONS: readonly AuthorizedQuestion[] =
  Object.values(MISTRAL_CONFIG.QUESTIONS);
