import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useSupabase } from '@/shared/api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui';

import { signInWithEmail } from '../api/sign-in';
import { signUpWithEmail } from '../api/sign-up';
import { persistPendingVerificationEmail } from '../model/pending-verification-email';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email.'),
  password: z.string().min(6, 'At least 6 characters.'),
});
type Values = z.infer<typeof schema>;

export interface EmailAuthFormProps {
  variant: 'login' | 'register';
  className?: string;
}

export function EmailAuthForm({ variant, className }: EmailAuthFormProps) {
  const client = useSupabase();
  const navigate = useNavigate();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  async function onSubmit(values: Values) {
    const result =
      variant === 'login'
        ? await signInWithEmail(client, values)
        : await signUpWithEmail(client, values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    if (variant === 'register') {
      const trimmedEmail = values.email.trim();
      if (result.session) {
        void navigate('/complete-profile', { replace: true });
        return;
      }
      persistPendingVerificationEmail(trimmedEmail);
      void navigate('/register/pending-verification', {
        replace: true,
        state: { email: trimmedEmail },
      });
      return;
    }

    toast.success("You're signed in.");
  }

  const submitting = form.formState.isSubmitting;
  const submitLabel = variant === 'login' ? 'Sign in' : 'Sign up';

  return (
    <Form {...form}>
      <form
        className={className}
        onSubmit={(e) => {
          void form.handleSubmit(onSubmit)(e);
        }}
        noValidate
      >
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete={
                      variant === 'login' ? 'current-password' : 'new-password'
                    }
                    required
                    minLength={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={submitting} className="mt-4 w-full">
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Please wait
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </Form>
  );
}
