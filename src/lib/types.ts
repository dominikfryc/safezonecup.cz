export type Tournament = {
  id: string;
  year: number;
  location: string | null;
  number_of_groups: number;
  number_of_teams: number;
  is_active: boolean;
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  tournament_id: string;
  group: string | null;
  created_at: string;
};

export type Player = {
  id: string;
  name: string;
  tournament_id: string;
  team_id: string;
  created_at: string;
};

export type Match = {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  stage: string; // 'group', 'quarterfinal', etc.
  status: string; // 'scheduled', 'in_progress', 'finished'
  home_score: number;
  away_score: number;
  start_time: string | null;
  created_at: string;
  home_team?: Team; // Joined
  away_team?: Team; // Joined
};

export type Goal = {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  minute: number | null;
  created_at: string;
  players?: Player; // Joined
};
