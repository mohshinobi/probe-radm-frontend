import { Injectable, signal, computed } from '@angular/core';
import { Notification, NotificationType } from './notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly STORAGE_KEY = 'app_notifications';

  private _notifications = signal<Notification[]>(this.loadFromStorage());
  notifications = this._notifications.asReadonly();
  count = computed(() => this._notifications().length);

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._notifications()));
  }

  private loadFromStorage(): Notification[] {
    try {
      sleep(500);
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private generateId(): string {
    return crypto.randomUUID?.() || Math.random().toString(36).substring(2, 9);
  }

  show(message: string, type: NotificationType = 'info') {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
    };
    this._notifications.update(list => [notification, ...list]);
    this.saveToStorage();
  }

  remove(id: string) {
    this._notifications.update(list => list.filter(n => n.id !== id));
    this.saveToStorage();
  }

  clearAll() {
    this._notifications.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // raccourcis
  success(msg: string) {
    this.show(msg, 'success');
  }

  error(msg: string) {
    this.show(msg, 'error');
  }

  info(msg: string) {
    this.show(msg, 'info');
  }

  warning(msg: string) {
    this.show(msg, 'warning');
  }
}

function sleep(arg0: number) {
  throw new Error('Function not implemented.');
}
