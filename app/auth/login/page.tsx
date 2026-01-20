import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Or"
      linkHref="/auth/signup"
      linkText="create a new account"
      linkLabel=""
    >
      <LoginForm />
    </AuthLayout>
  );
}
