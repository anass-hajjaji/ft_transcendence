export interface MatchHistory {
  game_id: number;
  winner_name: string;
  loser_name: string;
  win_score: number;
  lose_score: number;
  game_type: string;
  create_date: string;
}

export interface AuthUser {
  username: string;
  fullName?: string;
  email?: string;
}

export interface Stats {
  wins: number;
  losses: number;
  total: number;
  winRate: number;
  draws: number;
}
