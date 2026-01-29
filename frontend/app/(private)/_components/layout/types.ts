export interface UserProfile {
  id_user: number;
  username: string;
  fullName: string;
  status: string;
  wins: number;
  losses: number;
  avatar?: string;
  isFriend?: boolean;
}

export interface NavItem {
  id: string;
  href: string;
  match?: string[];
  label: string;
  icon?: string;
  divider?: boolean;
}

export type NotificationType = "message" | "game_invite" | "tournament_active" | "system";

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  sender?: string;
  link?: string;
  read: boolean;
  timestamp: number;
}

