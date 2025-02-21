
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  in_app: boolean;
}

export interface DatabaseUserProfile {
  notification_settings: NotificationSettings | null;
}

export interface SettingsState {
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  appearance: {
    fontSize: 'small' | 'normal' | 'large';
  };
}
