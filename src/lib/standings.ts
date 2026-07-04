export type TeamStats = {
  pts: number;
  gd: number;
  gs: number;
};

export function calculateTeamStats(matches: any[], allTeamIds?: string[]): Record<string, TeamStats> {
  const stats: Record<string, TeamStats> = {};

  matches.forEach((m) => {
    // Only count finished matches
    if (m.status !== 'finished') return;

    const home = m.home_team_id;
    const away = m.away_team_id;

    if (!stats[home]) stats[home] = { pts: 0, gd: 0, gs: 0 };
    if (!stats[away]) stats[away] = { pts: 0, gd: 0, gs: 0 };

    stats[home].gs += m.home_score;
    stats[away].gs += m.away_score;

    stats[home].gd += m.home_score - m.away_score;
    stats[away].gd += m.away_score - m.home_score;

    if (m.home_score > m.away_score) {
      stats[home].pts += 3;
    } else if (m.home_score < m.away_score) {
      stats[away].pts += 3;
    } else {
      stats[home].pts += 1;
      stats[away].pts += 1;
    }
  });

  // Ensure all tournament teams are in stats (even if 0 points)
  if (allTeamIds) {
    allTeamIds.forEach((id) => {
      if (!stats[id]) stats[id] = { pts: 0, gd: 0, gs: 0 };
    });
  }

  return stats;
}

export type SortableTeam = {
  id: string;
  name: string;
  group?: string | null;
  pts: number;
  gd: number;
  gs: number;
};

export function sortTeams<T extends SortableTeam>(teams: T[]): T[] {
  return [...teams].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts; // 1. Points
    if (b.gd !== a.gd) return b.gd - a.gd;     // 2. Goal Difference
    if (b.gs !== a.gs) return b.gs - a.gs;     // 3. Goals Scored
    
    // 4. Groups
    if (a.group !== b.group) {
      if (!a.group) return 1; // Unassigned teams go last
      if (!b.group) return -1;
      return a.group.localeCompare(b.group, undefined, { numeric: true });
    }
    
    // 5. Alphabetically
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}
