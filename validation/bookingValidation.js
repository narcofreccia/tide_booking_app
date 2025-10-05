import * as yup from 'yup';

// Helpers for HH:mm or HH:mm:ss parsing
const isValidTime = (value) => {
  if (typeof value !== 'string') return false;
  // Accept both HH:mm and HH:mm:ss formats
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
};

const bookingSchema = yup.object({
  restaurant_id: yup.number().typeError('Invalid restaurant').required('Restaurant required'),
  
  auto_table_selection: yup.boolean().default(true),
  
  table_ids: yup
    .array()
    .of(yup.number().typeError('Invalid table ID'))
    .nullable()
    .transform((v, o) => (Array.isArray(o) && o.length === 0 ? null : v)),
  
  user_id: yup.number().nullable().transform((v, o) => (o === '' || o == null ? null : v)),
  
  name: yup
    .string()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .test('name-or-surname', 'Name or surname required', function (value) {
      const surname = this.parent.surname;
      return !!(value || surname);
    }),
  
  surname: yup
    .string()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .test('name-or-surname', 'Name or surname required', function (value) {
      const name = this.parent.name;
      return !!(value || name);
    }),
  
  phone: yup
    .string()
    .nullable()
    .transform((v, o) => {
      // Transform empty string or just country code to null
      if (!o || o === '' || o === '+39' || o === '+') return null;
      return v;
    })
    .test('valid-phone-format', 'Telefono non valido. Usa formato internazionale (es. +39 123 456 7890)', (value) => {
      // Allow null/empty (optional field)
      if (!value || value === null) return true;
      
      // Must start with +
      if (!value.startsWith('+')) return false;
      
      // Remove + and spaces to check digits
      const digitsOnly = value.replace(/[^\d]/g, '');
      
      // Must have at least country code (1-3 digits) + phone number (minimum 6 digits)
      // Total minimum: 7 digits
      if (digitsOnly.length < 7) return false;
      
      // Must not be longer than 15 digits (international standard)
      if (digitsOnly.length > 15) return false;
      
      // Basic format check: + followed by digits (spaces allowed)
      const validFormat = /^\+[\d\s]+$/.test(value);
      
      return validFormat;
    }),
  
  email: yup
    .string()
    .email('Invalid email')
    .nullable()
    .transform((v, o) => (o === '' ? null : v)),

  arrival_time: yup
    .string()
    .test('valid-time', 'Invalid time format (HH:mm or HH:mm:ss)', (v) => isValidTime(v))
    .required('Arrival time required'),

  status: yup
    .string()
    .oneOf([
      'pending',
      'confirmed', 
      'cancelled_by_user',
      'cancelled_by_restaurant',
      'no_show',
      'arrived',
      'seated',
      'bill',
      'clean',
      'completed'
    ], 'Invalid status')
    .required('Status required'),

  reservation_date: yup
    .date()
    .typeError('Invalid date')
    .required('Date required')
    .test('not-past', 'Cannot select a past date', (v) => {
      if (!v) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return v >= today;
    }),

  adults: yup
    .number()
    .typeError('Invalid number')
    .integer('Must be an integer')
    .min(1, 'Minimum 1 adult')
    .required('Number of adults required'),

  children: yup
    .number()
    .typeError('Invalid number')
    .integer('Must be an integer')
    .min(0, 'Minimum 0')
    .default(0),

  highchair_number: yup
    .number()
    .nullable()
    .transform((v, o) => (o === '' || o == null ? null : v))
    .min(0, 'Must be >= 0'),

  wheelchair_number: yup
    .number()
    .nullable()
    .transform((v, o) => (o === '' || o == null ? null : v))
    .min(0, 'Must be >= 0'),

  costumer_notes: yup.string().nullable().transform((v, o) => (o === '' ? null : v)),
  restaurant_notes: yup.string().nullable().transform((v, o) => (o === '' ? null : v)),
});

export default bookingSchema;
