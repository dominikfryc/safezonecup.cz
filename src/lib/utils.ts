import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '-';

  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));

    return new Intl.DateTimeFormat('cs-CZ', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return timeString.substring(0, 5);
  }
}

export const stageTranslations: Record<string, string> = {
  group: 'Základní skupina',
  quarterfinal: 'Čtvrtfinále',
  semifinal: 'Semifinále',
  small_semifinal: 'Malé semifinále',
  final: 'Finále',
  small_final: 'O 3. místo',
  '5th_place': 'O 5. místo',
  '7th_place': 'O 7. místo',
  '9th_place': 'O 9. místo',
  '11th_place': 'O 11. místo'
};

export function translateStage(stage: string | null | undefined): string {
  if (!stage) return '';
  return stageTranslations[stage] || stage.replace(/_/g, ' ').toUpperCase();
}
