// src/utils/validationSchemas.js
import * as yup from 'yup';

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),
  password: yup
    .string()
    .required('Password is required'),
});

export const taskSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: yup
    .string()
    .max(500, 'Description cannot exceed 500 characters'),
  status: yup
    .string()
    .oneOf(['pending', 'in-progress', 'completed'], 'Invalid status'),
  priority: yup
    .string()
    .oneOf(['low', 'medium', 'high'], 'Invalid priority'),
  dueDate: yup
    .date()
    .nullable()
    .min(new Date(), 'Due date must be in the future'),
});