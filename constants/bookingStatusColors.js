// Booking status color mappings
export const BOOKING_STATUS_COLORS = {
  pending: '#FFA726',      // Orange
  confirmed: '#66BB6A',    // Green
  cancelled_by_user: '#EF5350',     // Red
  cancelled_by_restaurant: '#E57373', // Light Red
  no_show: '#BDBDBD',      // Grey
  arrived: '#42A5F5',      // Blue
  seated: '#29B6F6',       // Light Blue
  completed: '#4CAF50',    // Dark Green
  bill: '#9C27B0',         // Purple
}

export const BOOKING_STATUS_LABELS = {
  pending: 'In Attesa',
  confirmed: 'Confermata',
  cancelled_by_user: 'Cancellata (Cliente)',
  cancelled_by_restaurant: 'Cancellata (Ristorante)',
  no_show: 'Non Presentato',
  arrived: 'Arrivato',
  seated: 'Seduto',
  completed: 'Completato',
  bill: 'Conto',
}

export const getBookingStatusColor = (status) => {
  return BOOKING_STATUS_COLORS[status] || '#90CAF9' // Default blue
}

export const getBookingStatusLabel = (status) => {
  return BOOKING_STATUS_LABELS[status] || status
}
