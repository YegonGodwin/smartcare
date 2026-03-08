type ClassValue = string | boolean | undefined | null | 0 | 0n | ClassDictionary;

interface ClassDictionary {
  [id: string]: unknown;
}

export function classNames(...classes: ClassValue[]): string {
  return classes
    .flatMap((cls) => {
      if (typeof cls === 'string' || typeof cls === 'boolean') {
        return cls ? [cls] : [];
      }
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([_, value]) => value)
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(' ');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
