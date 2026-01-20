export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim() === '') {
    return { field: 'email', message: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }

  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password || password.trim() === '') {
    return { field: 'password', message: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      field: 'password',
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }

  return null;
}

export function validateName(name: string): ValidationError | null {
  if (!name || name.trim() === '') {
    return { field: 'name', message: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { field: 'name', message: 'Name must be less than 50 characters' };
  }

  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): ValidationError | null {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { field: 'confirmPassword', message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }

  return null;
}

export function validateLoginForm(data: LoginFormData): ValidationResult {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSignupForm(data: SignupFormData): ValidationResult {
  const errors: ValidationError[] = [];

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push(passwordError);

  const confirmPasswordError = validateConfirmPassword(
    data.password,
    data.confirmPassword
  );
  if (confirmPasswordError) errors.push(confirmPasswordError);

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getErrorMessage(error: any): string {
  // Handle specific error types
  if (error?.code === 'auth/user-not-found') {
    return 'No account found with this email address';
  }

  if (error?.code === 'auth/wrong-password') {
    return 'Incorrect password';
  }

  if (error?.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists';
  }

  if (error?.code === 'auth/weak-password') {
    return 'Password is too weak';
  }

  if (error?.code === 'auth/invalid-email') {
    return 'Invalid email address';
  }

  if (error?.code === 'auth/invalid-credential') {
    return 'Invalid email or password';
  }

  if (error?.code === 'auth/too-many-requests') {
    return 'Too many attempts. Please try again later';
  }

  // Handle network errors
  if (error?.message?.includes('Network')) {
    return 'Network error. Please check your connection';
  }

  // Default error message
  return error?.message || 'An error occurred. Please try again';
}
