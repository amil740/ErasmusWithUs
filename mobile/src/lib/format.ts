export function formatEuro(amount: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Date to be confirmed'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function formatTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function splitList(value: string) {
  return value.split(',').map((part) => part.trim()).filter(Boolean).filter((value, index, array) => array.indexOf(value) === index)
}
