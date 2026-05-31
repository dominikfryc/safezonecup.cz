import { createClient } from '@/utils/supabase/server'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import Scoreboard from '@/components/Scoreboard'
import StandingsTable from '@/components/StandingsTable'
import PlayoffTree from '@/components/PlayoffTree'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { AuthHashHandler } from '@/components/auth-hash-handler'

export default async function Home() {
  const supabase = await createClient()

  // Fetch active tournament
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_active', true)
    .limit(1)

  const activeTournament = tournaments?.[0]

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AuthHashHandler />
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                SAFEZONE CUP
              </h1>
            </div>
            
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#scoreboard" className={navigationMenuTriggerStyle()}>
                    Scoreboard
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#groups" className={navigationMenuTriggerStyle()}>
                    Groups
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#playoffs" className={navigationMenuTriggerStyle()}>
                    Playoffs
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem className="ml-4">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/admin">Admin</Link>
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="md:hidden">
              <Button asChild variant="secondary" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTournament ? (
          <div className="space-y-32">
            <div className="text-center space-y-4 pt-10">
              <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase">Live Tournament</h2>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter">
                SAFEZONE CUP {activeTournament.year}
              </h3>
              {activeTournament.location && (
                <p className="text-xl text-muted-foreground mt-2">{activeTournament.location}</p>
              )}
            </div>

            {/* Scoreboard */}
            <section id="scoreboard" className="scroll-mt-32">
              <Scoreboard tournamentId={activeTournament.id} />
            </section>

            {/* Group Standings */}
            <section id="groups" className="scroll-mt-32">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Group Standings</h2>
                <p className="text-muted-foreground">Live points, goal difference, and qualification status.</p>
              </div>
              <StandingsTable tournamentId={activeTournament.id} />
            </section>

            {/* Playoffs */}
            <section id="playoffs" className="scroll-mt-32">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Playoff Bracket</h2>
                <p className="text-muted-foreground">The road to the championship.</p>
              </div>
              <PlayoffTree tournamentId={activeTournament.id} />
            </section>
          </div>
        ) : (
          <div className="text-center py-32 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-border mb-4">
              <Trophy className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">No Active Tournament</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              There is currently no active tournament. An admin needs to set one up in the dashboard.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
