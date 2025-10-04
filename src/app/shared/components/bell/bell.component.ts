import { Component, computed, inject, signal } from '@angular/core';
import { NotificationService } from './notification.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-notification-bell',
    templateUrl: './bell.component.html',
    styleUrls: ['./bell.component.scss'],
    imports: [CommonModule, MatIconModule]
})
export class NotificationBellComponent {

  _notificationService = inject(NotificationService);
  isOpen = signal(false);
  notifications = this._notificationService.notifications;
  count = computed(() => this.notifications().length);


  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  remove(id: string) {
    this._notificationService.remove(id);
  }

  clearAll() {
    this._notificationService.clearAll();
    this.isOpen.set(false);
  }
}
