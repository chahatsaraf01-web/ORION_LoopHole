
export enum ItemStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  RETURNED = 'RETURNED',
  CLOSED = 'CLOSED'
}

export enum ReportType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export interface User {
  id: string;
  name: string;
  email: string;
  campus: string;
  isVerified: boolean;
  muteGlobalNotifications?: boolean;
}

export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  category: string;
  itemName: string;
  description: string;
  location: string;
  dateTime: string;
  imageUrl?: string;
  status: ItemStatus;
  isSensitive: boolean; // For blurring in feed
  verificationQuestion?: string;
  verificationAnswer?: string;
  createdAt: number;
}

export interface Match {
  id: string;
  lostReportId: string;
  foundReportId: string;
  confidence: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  attempts: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string; // Use 'SYSTEM' for system messages
  text: string;
  timestamp: number;
}

export interface Handover {
  matchId: string;
  code: string;
  isConfirmedByOwner: boolean;
  isConfirmedByFinder: boolean;
}
