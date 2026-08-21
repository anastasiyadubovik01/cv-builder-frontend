export const parseDate = (dateStr?: string | null): Date | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const formatPeriodDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const cleaned = dateStr.trim();
  if (cleaned.toLowerCase() === 'present') return 'Present';

  if (/^\d{2}\.\d{4}$/.test(cleaned)) return cleaned;

  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return cleaned;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}.${year}`;
};
