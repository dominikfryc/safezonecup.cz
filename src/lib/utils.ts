import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return timeString.substring(0, 5);
  }
}
