import { Trophy } from 'lucide-react';

export function PublicTournamentHeader({ tournament }: { tournament: any }) {
  if (!tournament) {
    return (
      <div className="text-center py-32 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border border-border mb-4">
          <Trophy className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Žádný aktivní turnaj</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
          Momentálně neprobíhá žádný turnaj. Administrátor jej musí nastavit.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 pt-4 mb-16">
      <h2 className="text-sm font-bold tracking-widest text-blue-500 uppercase">Aktuální turnaj</h2>
      <h3 className="text-5xl md:text-7xl font-black tracking-tighter">{tournament.name}</h3>
      {tournament.location && (
        <p className="text-xl text-muted-foreground mt-2">{tournament.location}</p>
      )}
    </div>
  );
}
