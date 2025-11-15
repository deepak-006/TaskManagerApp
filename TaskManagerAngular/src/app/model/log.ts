export interface LogEntry {
  id: number;
  message: string;
  messageTemplate: string;
  level: string;
  timeStamp: string;  // ISO Date string
  exception: string | null;
  properties: string; // XML string
}
