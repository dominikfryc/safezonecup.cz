import { Match } from '@/lib/types'
import { Trophy, Medal, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function TournamentResults({ matches }: { matches: Match[] }) {
  const finalMatch = matches.find(m => m.stage === 'final')
  const smallFinal = matches.find(m => m.stage === 'small_final')
  
  if (!finalMatch || finalMatch.status !== 'finished' || !smallFinal || smallFinal.status !== 'finished') {
    return null
  }

  const getWinnerLoser = (match: Match | undefined) => {
    if (!match) return { winner: null, loser: null }
    return match.home_score > match.away_score 
      ? { winner: match.home_team, loser: match.away_team }
      : { winner: match.away_team, loser: match.home_team }
  }

  const { winner: firstPlace, loser: secondPlace } = getWinnerLoser(finalMatch)
  const { winner: thirdPlace, loser: fourthPlace } = getWinnerLoser(smallFinal)
  
  const fifthMatch = matches.find(m => m.stage === '5th_place')
  const { winner: fifthPlace, loser: sixthPlace } = getWinnerLoser(fifthMatch)
  
  const seventhMatch = matches.find(m => m.stage === '7th_place')
  const { winner: seventhPlace, loser: eighthPlace } = getWinnerLoser(seventhMatch)
  
  const ninthMatch = matches.find(m => m.stage === '9th_place')
  const { winner: ninthPlace, loser: tenthPlace } = getWinnerLoser(ninthMatch)
  
  const eleventhMatch = matches.find(m => m.stage === '11th_place')
  const { winner: eleventhPlace, loser: twelfthPlace } = getWinnerLoser(eleventhMatch)

  const standings = [
    { rank: 1, team: firstPlace },
    { rank: 2, team: secondPlace },
    { rank: 3, team: thirdPlace },
    { rank: 4, team: fourthPlace },
    { rank: 5, team: fifthPlace },
    { rank: 6, team: sixthPlace },
    { rank: 7, team: seventhPlace },
    { rank: 8, team: eighthPlace },
    { rank: 9, team: ninthPlace },
    { rank: 10, team: tenthPlace },
    { rank: 11, team: eleventhPlace },
    { rank: 12, team: twelfthPlace },
  ].filter(s => s.team)

  return (
    <div className="flex flex-col gap-12 mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
          Tournament Concluded
        </h2>
        <p className="text-muted-foreground text-lg">Congratulations to the champions and all participating teams!</p>
      </div>

      {/* Podium */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-6 h-auto md:h-[300px] mt-8">
        {/* 2nd Place */}
        {secondPlace && (
          <div className="flex flex-col items-center justify-end w-full md:w-1/4 order-2 md:order-1 h-[250px] md:h-[80%]">
            <div className="flex flex-col items-center mb-4">
              <Medal className="w-12 h-12 text-slate-300 mb-2 drop-shadow-md" />
              <span className="font-bold text-xl text-center px-4">{secondPlace.name}</span>
            </div>
            <div className="w-full h-full bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-xl border border-slate-300 dark:border-slate-600 flex items-start justify-center pt-4 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 dark:bg-white/5"></div>
              <span className="text-5xl font-black text-slate-400/50">2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {firstPlace && (
          <div className="flex flex-col items-center justify-end w-full md:w-1/3 order-1 md:order-2 h-[300px] md:h-full z-10">
            <div className="flex flex-col items-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-400 mb-2 drop-shadow-lg" />
              <span className="font-black text-2xl text-center px-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">{firstPlace.name}</span>
            </div>
            <div className="w-full h-full bg-gradient-to-t from-yellow-400 to-yellow-200 dark:from-yellow-600 dark:to-yellow-500 rounded-t-xl border border-yellow-300 dark:border-yellow-500 flex items-start justify-center pt-4 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 dark:bg-white/10"></div>
              <span className="text-6xl font-black text-yellow-600/50 dark:text-yellow-900/30">1</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {thirdPlace && (
          <div className="flex flex-col items-center justify-end w-full md:w-1/4 order-3 md:order-3 h-[220px] md:h-[70%]">
            <div className="flex flex-col items-center mb-4">
              <Award className="w-12 h-12 text-amber-600 mb-2 drop-shadow-md" />
              <span className="font-bold text-xl text-center px-4">{thirdPlace.name}</span>
            </div>
            <div className="w-full h-full bg-gradient-to-t from-amber-700/80 to-amber-600/80 dark:from-amber-900/80 dark:to-amber-800/80 rounded-t-xl border border-amber-600 dark:border-amber-700 flex items-start justify-center pt-4 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 dark:bg-white/5"></div>
              <span className="text-5xl font-black text-amber-900/30">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Final Standings */}
      <Card className="mt-8 bg-card shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Final Standings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {standings.map(({ rank, team }) => (
              <div key={team?.id || rank} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border/50 transition-colors hover:bg-secondary">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  rank === 2 ? 'bg-slate-300 text-slate-800' :
                  rank === 3 ? 'bg-amber-600 text-amber-50' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {rank}
                </div>
                <span className="font-medium truncate">{team?.name || 'TBD'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
