// JHCGN PWA Types

export interface User {
  uid: string;
  email: string;
  role: string;
  pendingInvites: string[];
}

export type RoomRole = 'invited'|'member'|'owner';

export type RoomMember = {
  uid: string;
  role: RoomRole;
  arrived: boolean;
}

export type RoomLogEntry = {
  timestamp: number;
  performerId: string;
  subjectId: string | null;
  action: string;
}

export interface Room {
  name: string;
  members: { [uid: string]: RoomMember };
  allowUrlJoining: boolean;
  logs: RoomLogEntry[];
}
