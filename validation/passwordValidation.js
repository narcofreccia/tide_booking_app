import * as yup from 'yup';

/**
 * Password Change Validation Schema
 */
export const passwordChangeSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required('La password attuale è obbligatoria')
    .min(1, 'La password attuale è obbligatoria'),
  
  newPassword: yup
    .string()
    .required('La nuova password è obbligatoria')
    .min(8, 'La password deve contenere almeno 8 caratteri')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero'
    ),
  
  confirmPassword: yup
    .string()
    .required('Conferma la nuova password')
    .oneOf([yup.ref('newPassword'), null], 'Le password non corrispondono'),
});
