import { ScheduleItem } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { formatTime } from '@/lib/utils'

export default function TournamentSchedule({ schedules }: { schedules: ScheduleItem[] }) {
  const sortedSchedules = [...schedules].sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  return (
    <div className="flex flex-col gap-6 mt-12">
      <div className="flex items-center gap-3">
        <div className="size-2.5 rounded-full bg-purple-500"></div>
        <h3 className="text-2xl font-bold">Tournament Event Schedule</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {sortedSchedules.map(item => (
          <Card key={item.id} className="overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-6">
              <div className="font-mono font-bold text-lg bg-secondary px-4 py-2 rounded-md text-primary text-center min-w-[100px]">
                {formatTime(item.time)}
              </div>
              <div className="text-lg font-medium text-foreground">
                {item.event}
              </div>
            </CardContent>
          </Card>
        ))}
        {sortedSchedules.length === 0 && (
          <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No events scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
