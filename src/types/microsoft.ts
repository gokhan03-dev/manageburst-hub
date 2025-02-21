
export interface MicrosoftAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  body: {
    content: string;
    contentType: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}
