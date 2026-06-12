import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  appUserQueryKeys,
  isAppUserOnboardingComplete,
  updateAppUser,
  useAppUserQuery,
  useUserStore,
  type UserSex,
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

const USER_SEX_OPTIONS = [
  'Male',
  'Female',
  'Other',
  'Prefer Not to Say',
] as const satisfies readonly UserSex[];

const schema = z.object({
  displayName: z.string().trim().min(1, 'Enter a display name.'),
  sex: z.enum(USER_SEX_OPTIONS, { message: 'Select an option.' }),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'),
});
type Values = z.infer<typeof schema>;

export function CompleteProfilePage() {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userId = useUserStore((s) => s.userId);
  const { data: appUser, isPending } = useAppUserQuery();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', sex: undefined, birthdate: '' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!appUser) {
      return;
    }
    form.reset({
      displayName: appUser.display_name?.trim() ?? '',
      sex: appUser.sex ?? undefined,
      birthdate: appUser.birthdate ?? '',
    });
  }, [appUser, form]);

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

  if (isAppUserOnboardingComplete(appUser)) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">
            Profile complete
          </h1>
          <CardDescription>
            Your profile details are saved. Continue to the dashboard.
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
      const updated = await updateAppUser(client, {
        display_name: values.displayName,
        sex: values.sex,
        birthdate: values.birthdate,
      });
      if (userId) {
        queryClient.setQueryData(appUserQueryKeys.byUserId(userId), updated);
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
          Choose how we greet you and add a few details so Nexus can personalize
          your experience.
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
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      required
                    >
                      <option value="" disabled>
                        Select…
                      </option>
                      {USER_SEX_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birthdate</FormLabel>
                  <FormControl>
                    <Input type="date" required {...field} />
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
