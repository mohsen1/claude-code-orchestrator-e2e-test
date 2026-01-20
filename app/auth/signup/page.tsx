import AuthLayout from './components/AuthLayout';
import SignupForm from './components/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Already have an account?"
      linkHref="/auth/login"
      linkText="Sign in"
      linkLabel=""
    >
      <SignupForm />
    </AuthLayout>
  );
}
