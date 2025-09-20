// JHCGN PWA Types

export interface User {
  uid: string;
  email: string;
  role: string;
}

export type RoomRole = 'invited'|'member'|'owner';

export interface Room {
  name: string;
  members: { [uid: string]: RoomRole };
}
