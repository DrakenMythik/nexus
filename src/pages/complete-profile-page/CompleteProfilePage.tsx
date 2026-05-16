import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  profileQueryKeys,
  upsertProfile,
  useProfileQuery,
  useUserStore,
} from '@/entities/user';
import { useSupabase } from '@/shared/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Skeleton,
} from '@/shared/ui';

const schema = z.object({
  displayName: z.string().trim().min(1, 'Enter a display name.'),
});
type Values = z.infer<typeof schema>;

export function CompleteProfilePage() {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userId = useUserStore((s) => s.userId);
  const { data: profile, isPending } = useProfileQuery();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '' },
    mode: 'onSubmit',
  });

  const existingName = profile?.display_name?.trim();

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">
            Finish setting up
          </h1>
          <CardDescription>Loading your profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (existingName) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile complete
          </h1>
          <CardDescription>
            You already have a display name set. Continue to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(values: Values) {
    try {
      const updated = await upsertProfile(client, {
        display_name: values.displayName,
      });
      if (userId) {
        queryClient.setQueryData(profileQueryKeys.byUserId(userId), updated);
      }
      void navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save your profile.';
      toast.error(message);
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold tracking-tight">
          Finish setting up
        </h1>
        <CardDescription>
          Choose how we should greet you in the app. You can change this later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="nickname"
                      required
                      minLength={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Save and continue'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
