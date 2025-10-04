export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';