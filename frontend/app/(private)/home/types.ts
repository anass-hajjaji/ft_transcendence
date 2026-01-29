export interface Game {
  id: number;
  game: string;
  time: string;
  score: string;
  opponent: string;
  win: boolean;
  result?: 'win' | 'loss' | 'draw';
}

export interface GameTypeData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface PerformanceStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  avgPointsPerGame: number;
  totalPoints: number;
  bestStreak: number;
}

export interface AuthUser {
  username: string;
  fullName?: string;
  email?: string;
}


export interface MatchHistory {
  game_id: number;
  winner_name: string;
  loser_name: string;
  game_type?: string;
  create_date: string;
  win_score: number;
  lose_score: number;
}