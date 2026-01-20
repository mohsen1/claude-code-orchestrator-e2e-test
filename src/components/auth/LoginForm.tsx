'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoogleButton } from './GoogleButton';
import { PasswordForm } from './PasswordForm';
import { Mail } from 'lucide-react';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
            <Mail className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4">
            <div className="space-y-4">
              <GoogleButton isLoading={isLoading} setLoading={setIsLoading} />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sign in with your email and password
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <PasswordForm isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
