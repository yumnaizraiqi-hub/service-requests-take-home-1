const ALLOWED: Record<string, string[]> = {
  submitted:   ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved:    ['closed', 'rejected'],
  closed:      [],                     
  rejected:    [],                     
};

export function canTransition(from: string, to: string): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}