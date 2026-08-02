/**
 * Formats a number as Philippine Peso (PHP).
 * e.g. 1250 → ₱1,250.00
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string, timeString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  let formattedDate = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

  if (timeString) {
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    if (!isNaN(h)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      formattedDate += `, ${h12}:${minutes} ${ampm}`;
    }
  }

  return formattedDate;
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
