#!/bin/bash
mkdir -p src/app/\(public\)/matches
mkdir -p src/app/\(public\)/groups
mkdir -p src/app/\(public\)/playoffs
mkdir -p src/components

# Create PublicLayout
cat << 'INNEREOF' > src/app/\(public\)/layout.tsx
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { AuthHashHandler } from '@/components/auth-hash-handler'
import { headers } from 'next/headers'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      <AuthHashHandler />
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground hidden sm:block">
                SAFEZONE CUP
              </h1>
            </Link>
            
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/matches" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Matches
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/groups" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Groups
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/playoffs" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Playoffs
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem className="ml-4">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/admin">Admin</Link>
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="md:hidden flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/matches">Matches</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/groups">Groups</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/playoffs">Playoffs</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  )
}
INNEREOF

# Shared helper for fetching active tournament
cat << 'INNEREOF' > src/components/PublicTournamentHeader.tsx
import { Trophy } from 'lucide-react'

export function PublicTournamentHeader({ tournament }: { tournament: any }) {
  if (!tournament) {
    return (
      <div className="text-center py-32 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-border mb-4">
          <Trophy className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">No Active Tournament</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
          There is currently no active tournament. An admin needs to set one up in the dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4 pt-4 mb-16">
      <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase">Live Tournament</h2>
      <h3 className="text-5xl md:text-7xl font-black tracking-tighter">
        SAFEZONE CUP {tournament.year}
      </h3>
      {tournament.location && (
        <p className="text-xl text-muted-foreground mt-2">{tournament.location}</p>
      )}
    </div>
  )
}
INNEREOF

# Page: Matches
cat << 'INNEREOF' > src/app/\(public\)/matches/page.tsx
import { createClient } from '@/utils/supabase/server'
import Scoreboard from '@/components/Scoreboard'
import { PublicTournamentHeader } from '@/components/PublicTournamentHeader'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1)
  const activeTournament = tournaments?.[0]

  return (
    <div>
      <PublicTournamentHeader tournament={activeTournament} />
      {activeTournament && (
        <section>
          <Scoreboard tournamentId={activeTournament.id} />
        </section>
      )}
    </div>
  )
}
INNEREOF

# Page: Groups
cat << 'INNEREOF' > src/app/\(public\)/groups/page.tsx
import { createClient } from '@/utils/supabase/server'
import StandingsTable from '@/components/StandingsTable'
import { PublicTournamentHeader } from '@/components/PublicTournamentHeader'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1)
  const activeTournament = tournaments?.[0]

  return (
    <div>
      <PublicTournamentHeader tournament={activeTournament} />
      {activeTournament && (
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Group Standings</h2>
            <p className="text-muted-foreground">Live points, goal difference, and qualification status.</p>
          </div>
          <StandingsTable tournamentId={activeTournament.id} />
        </section>
      )}
    </div>
  )
}
INNEREOF

# Page: Playoffs
cat << 'INNEREOF' > src/app/\(public\)/playoffs/page.tsx
import { createClient } from '@/utils/supabase/server'
import PlayoffTree from '@/components/PlayoffTree'
import { PublicTournamentHeader } from '@/components/PublicTournamentHeader'

export default async function PlayoffsPage() {
  const supabase = await createClient()
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1)
  const activeTournament = tournaments?.[0]

  return (
    <div>
      <PublicTournamentHeader tournament={activeTournament} />
      {activeTournament && (
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Playoff Bracket</h2>
            <p className="text-muted-foreground">The road to the championship.</p>
          </div>
          <PlayoffTree tournamentId={activeTournament.id} />
        </section>
      )}
    </div>
  )
}
INNEREOF

# Redirect root page to /matches
cat << 'INNEREOF' > src/app/\(public\)/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/matches')
}
INNEREOF

# Remove old page
rm src/app/page.tsx

echo "Done separating pages"
