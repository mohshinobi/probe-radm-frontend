import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { NgForOf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
    selector: 'app-time-selector',
    imports: [
    MatButtonToggleGroup,
    MatButtonToggle,
    NgForOf,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    CommonModule,
    FormsModule
],
    templateUrl: './time-selector.component.html',
    styleUrl: './time-selector.component.scss'
})
export class TimeSelectorComponent implements OnInit {
  @Input() options?: { value: string | number, label: string }[];
  @Input() title?: string;
  @Input() subTitle?: string;
  @Input() condition: boolean = false;
  @Input() selectedTime: number | string = 24;

  @Output() customSelected = new EventEmitter<any>();
  @Output() timeChange = new EventEmitter<number | string>();

  showCustomForm = false;
  showDates = false;

  beginDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  endDate = new Date();

  customSelectedData = { beginDate: '', endDate: '' };

  beginDateSelect:  string = '';
  endDateSelect:    string = '';
  beginHourSelect:  string = '';
  endHourSelect:    string = '';

  customValidation: boolean = false;

  daysList: { name: string; value: Date }[] = [];
  hoursList: { name: string; value: string }[] = [];

  ngOnInit() {
    this.daysList = this.getDays();
    this.hoursList = this.getHours();
  }

  resetSelectedCustom() {
    this.beginDateSelect  = '';
    this.endDateSelect    = '';
    this.beginHourSelect  = '';
    this.endHourSelect    = '';
    this.customSelectedData = { beginDate: '', endDate: '' };
  }

  onTimeChange(value: number | string) {
    if (value !== 'Custom') {
      this.resetSelectedCustom();
      this.showDates = false;
      this.showCustomForm = false;
      const hours = typeof value === 'string' ? parseInt(value, 10) : value;
      if (!isNaN(hours)) {
        this.selectedTime = hours;
        this.timeChange.emit(hours);
        this.updateDates(hours);
      } else {
        console.error('Invalid time value:', value);
      }
    }
  }

  tooltipClick() {
    this.showCustomForm = !this.showCustomForm;
  }

  getDays() {
    return Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return { name: `j-${i}`, value: date };
    });
  }

  getFilteredBeginDays() {
    if (!this.endDateSelect) return this.daysList;
    const offset = parseInt(this.endDateSelect.replace('j-', ''), 10);
    const maxBeginDate = new Date();
    maxBeginDate.setDate(maxBeginDate.getDate() - offset);
    return this.daysList.filter(day => new Date(day.value) <= maxBeginDate);
  }

  getFilteredEndDays() {
    if (!this.beginDateSelect) return this.daysList;
    const offset = parseInt(this.beginDateSelect.replace('j-', ''), 10);
    const minEndDate = new Date();
    minEndDate.setDate(minEndDate.getDate() - offset - 1);
    return this.daysList.filter(day => new Date(day.value) >= minEndDate);
  }

  getHours() {
    return Array.from({ length: 48 }, (_, i) => {
      const hour = new Date();
      hour.setHours(0);
      hour.setMinutes(i * 30);
      const formattedHour = this.formatHour(hour);
      return { name: formattedHour, value: formattedHour };
    });
  }

  getFilteredBeginHours() {
    return this.hoursList;
  }

  getFilteredEndHours() {
    if (!this.beginHourSelect || this.beginDateSelect !== this.endDateSelect) return this.hoursList;
    const [startHour, startMinute] = this.beginHourSelect.split(':').map(Number);
    return this.hoursList.filter(hour => {
      const [hourVal, minuteVal] = hour.value.split(':').map(Number);
      return hourVal > startHour || (hourVal === startHour && minuteVal >= startMinute);
    });
  }

  formatHour(date: Date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  day(value: string) {
    const offset = parseInt(value.replace('j-', '-'));
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + offset);
    return currentDate;
  }

  hour(value: string, date: Date) {
    const [hour, minute] = value.split(':').map(Number);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0);
  }

  onDateChange(type: TypeTime, event: any) {
    if (event.target.value === '--') return;
    switch (type) {
      case TypeTime.DateBegin:
        this.beginDate = this.day(event.target.value);
        break;
      case TypeTime.DateEnd:
        this.endDate = this.day(event.target.value);
        break;
      case TypeTime.HourBegin:
        this.beginDate = this.hour(event.target.value, this.beginDate);
        this.customSelectedData.beginDate = this.beginDate.toString();
        break;
      case TypeTime.HourEnd:
        this.endDate = this.hour(event.target.value, this.endDate);
        this.customSelectedData.endDate = this.endDate.toString();
        break;
    }
    if (this.customSelectedData.beginDate && this.customSelectedData.endDate) {
      this.customSelected.emit(this.customSelectedData);
      this.showDates = true;
    }
  }

  private updateDates(hours: number) {
    this.beginDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    this.endDate = new Date();
  }

  typeTime = TypeTime;
}

enum TypeTime {
  DateBegin = "dateBegin",
  DateEnd = "dateEnd",
  HourBegin = "hourBegin",
  HourEnd = "hourEnd"
}
