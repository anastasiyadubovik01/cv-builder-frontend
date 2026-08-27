export const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function parseCommaSeparated(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatArrayToCommaSeparated(
  value?: string[] | string | null,
): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  return value;
}
