
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { CalendarSyncError } from "@/types/task";

export class CalendarSync {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getIntegrationSettings() {
    const { data, error } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('user_id', this.userId)
      .eq('integration_type', 'microsoft_calendar')
      .single();

    if (error) throw new CalendarSyncError(
      'Failed to fetch integration settings',
      'other',
      true
    );

    return data;
  }

  async importCalendarItems(): Promise<void> {
    try {
      const settings = await this.getIntegrationSettings();
      if (!settings?.sync_enabled) {
        console.log('Calendar sync is disabled');
        return;
      }

      const response = await fetch('/api/calendar/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: this.userId }),
      });

      if (!response.ok) {
        throw new CalendarSyncError(
          'Failed to import calendar items',
          'network',
          true
        );
      }
    } catch (error) {
      console.error('Calendar import error:', error);
      throw error instanceof CalendarSyncError ? error : new CalendarSyncError(
        'Unknown error during calendar import',
        'other',
        true
      );
    }
  }

  async createCalendarItem(task: Task): Promise<void> {
    try {
      const settings = await this.getIntegrationSettings();
      if (!settings?.sync_enabled) return;

      const response = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, userId: this.userId }),
      });

      if (!response.ok) {
        throw new CalendarSyncError(
          'Failed to create calendar item',
          'network',
          true
        );
      }
    } catch (error) {
      console.error('Calendar create error:', error);
      throw error instanceof CalendarSyncError ? error : new CalendarSyncError(
        'Unknown error during calendar item creation',
        'other',
        true
      );
    }
  }

  async updateCalendarItem(task: Task): Promise<void> {
    try {
      const settings = await this.getIntegrationSettings();
      if (!settings?.sync_enabled) return;

      const response = await fetch('/api/calendar/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, userId: this.userId }),
      });

      if (!response.ok) {
        throw new CalendarSyncError(
          'Failed to update calendar item',
          'network',
          true
        );
      }
    } catch (error) {
      console.error('Calendar update error:', error);
      throw error instanceof CalendarSyncError ? error : new CalendarSyncError(
        'Unknown error during calendar item update',
        'other',
        true
      );
    }
  }

  async deleteCalendarItem(taskId: string): Promise<void> {
    try {
      const settings = await this.getIntegrationSettings();
      if (!settings?.sync_enabled) return;

      const response = await fetch('/api/calendar/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, userId: this.userId }),
      });

      if (!response.ok) {
        throw new CalendarSyncError(
          'Failed to delete calendar item',
          'network',
          true
        );
      }
    } catch (error) {
      console.error('Calendar delete error:', error);
      throw error instanceof CalendarSyncError ? error : new CalendarSyncError(
        'Unknown error during calendar item deletion',
        'other',
        true
      );
    }
  }
}
