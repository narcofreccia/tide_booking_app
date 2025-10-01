import * as yup from 'yup';

// Helpers for HH:mm parsing
const isHhmm = (value) => typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);

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
    .transform((v, o) => (o === '' ? null : v)),
  
  email: yup
    .string()
    .email('Invalid email')
    .nullable()
    .transform((v, o) => (o === '' ? null : v)),

  arrival_time: yup
    .string()
    .test('hhmm', 'Invalid time format (HH:mm)', (v) => isHhmm(v))
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
