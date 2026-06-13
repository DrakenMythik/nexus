import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Activity, Dumbbell, Moon, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import {
  readinessBand,
  summarizeAdherence,
  useRecentAdherenceQuery,
  useUpsertAdherenceEventMutation,
} from '@/entities/adherence';
import {
  summarizeBiometricTrends,
  useDailyBiometricsQuery,
  useRecentDailyBiometricsQuery,
} from '@/entities/daily-biometrics';
import {
  useProgramWithWorkoutsQuery,
  usePublishedProgramsQuery,
} from '@/entities/program';
import {
  nextWorkoutPushDate,
  resolveTodayWorkoutState,
  selectDefaultProgram,
  useActiveEnrollmentQuery,
  useActiveWorkoutLogQuery,
  useCreateDefaultEnrollmentMutation,
  useStartWorkoutLogMutation,
  useUpdateEnrollmentPositionMutation,
} from '@/entities/workout-session';
import { appUserGreetingName, useAppUserQuery, useUserStore } from '@/entities/user';
import { formatLocalDate } from '@/shared/lib';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/ui';

export function DashboardPage() {
  const navigate = useNavigate();
  const userId = useUserStore((s) => s.userId);
  const authHydrated = useUserStore((s) => s.authHydrated);
  const { data, isPending } = useAppUserQuery();
  const today = formatLocalDate();
  const dailyQuery = useDailyBiometricsQuery(userId, today);
  const recentDailyQuery = useRecentDailyBiometricsQuery(userId);
  const adherenceQuery = useRecentAdherenceQuery(userId);
  const programsQuery = usePublishedProgramsQuery();
  const enrollmentQuery = useActiveEnrollmentQuery(userId);
  const activeLogQuery = useActiveWorkoutLogQuery(userId);
  const createEnrollment = useCreateDefaultEnrollmentMutation(userId);
  const startWorkout = useStartWorkoutLogMutation(userId);
  const updateEnrollment = useUpdateEnrollmentPositionMutation();
  const upsertAdherence = useUpsertAdherenceEventMutation(userId);

  const readyForName = authHydrated && Boolean(userId) && !isPending;
  const name = appUserGreetingName(data);
  const defaultProgram = selectDefaultProgram(programsQuery.data ?? []);
  const programId = enrollmentQuery.data?.program_id ?? defaultProgram?.id;
  const programQuery = useProgramWithWorkoutsQuery(programId);
  const adherenceSummary = summarizeAdherence(adherenceQuery.data ?? []);
  const trends = summarizeBiometricTrends(recentDailyQuery.data ?? []);
  const todayState = resolveTodayWorkoutState({
    program: programQuery.data,
    enrollment: enrollmentQuery.data ?? null,
    activeLog: activeLogQuery.data ?? null,
    today,
  });
  const readiness = dailyQuery.data?.readiness_score ?? null;
  const band = readiness ? readinessBand(readiness) : null;
  const nextWorkout = todayState.workout;
  const isLoading =
    dailyQuery.isPending ||
    programsQuery.isPending ||
    enrollmentQuery.isPending ||
    activeLogQuery.isPending;

  const topTrends = useMemo(
    () => trends.filter((trend) => trend.latest != null).slice(0, 3),
    [trends],
  );

  if (!dailyQuery.isPending && !dailyQuery.data) {
    return <Navigate replace to="/daily" />;
  }

  async function handleStartWorkout() {
    if (!userId || !defaultProgram || !nextWorkout) {
      return;
    }

    try {
      let enrollment = enrollmentQuery.data;
      if (!enrollment) {
        enrollment = await createEnrollment.mutateAsync(defaultProgram.id);
      }
      await startWorkout.mutateAsync({
        workoutId: nextWorkout.id,
        clientMutationId: `workout-${userId}-${nextWorkout.id}-${Date.now()}`,
      });
      navigate('/workout');
    } catch {
      toast.error('Could not start workout. Try again when your connection is stable.');
    }
  }

  async function handleSmartRest(commitment: 'push_tomorrow' | 'sleep_priority' | 'hydrate' | 'mobility') {
    if (!userId || !enrollmentQuery.data) {
      return;
    }

    try {
      await upsertAdherence.mutateAsync({
        eventDate: today,
        status: 'smart_rest',
        source: 'smart_rest',
        smartRestCommitment: commitment,
      });
      await updateEnrollment.mutateAsync({
        enrollmentId: enrollmentQuery.data.id,
        userId,
        position: {
          current_week_number: enrollmentQuery.data.current_week_number,
          current_day_number: enrollmentQuery.data.current_day_number,
          pushed_until: nextWorkoutPushDate(today),
        },
      });
      toast.success('Smart Rest credited. Tomorrow is queued up.');
    } catch {
      toast.error('Could not save Smart Rest yet.');
    }
  }

  return (
    <div className="space-y-4">
      {readyForName && name ? (
        <p className="text-lg font-medium text-foreground">Hello, {name}</p>
      ) : null}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Today in Nexus</h1>
        <p className="text-sm text-muted-foreground">
          Train for the day you actually have.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : null}

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Readiness & adherence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Readiness</p>
              <p className="text-2xl font-semibold">{readiness ?? '-'}/10</p>
              <p className="text-xs text-muted-foreground">
                {band === 'rest'
                  ? 'Smart Rest is a strong option.'
                  : band === 'adjust'
                    ? 'Consider a lighter session.'
                    : 'Green light to train.'}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">4-week adherence</p>
              <p className="text-2xl font-semibold">{adherenceSummary.percent}%</p>
              <p className="text-xs text-muted-foreground">
                {adherenceSummary.creditedDays}/{adherenceSummary.prescribedDays} credited days
              </p>
            </div>
          </div>
          {band === 'rest' ? (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-sm font-medium">Earn Smart Rest credit</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => void handleSmartRest('push_tomorrow')}>
                  Push to tomorrow
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleSmartRest('sleep_priority')}>
                  Prioritize sleep
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleSmartRest('hydrate')}>
                  Hydrate
                </Button>
                <Button size="sm" variant="outline" onClick={() => void handleSmartRest('mobility')}>
                  Mobility walk
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="size-5 text-primary" />
            Next workout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nextWorkout ? (
            <>
              <div>
                <p className="text-lg font-semibold">{nextWorkout.name}</p>
                <p className="text-sm text-muted-foreground">
                  Week {nextWorkout.week_number}, day {nextWorkout.day_number}
                </p>
              </div>
              <Button className="w-full" onClick={() => void handleStartWorkout()}>
                {activeLogQuery.data ? 'Resume workout' : 'Start workout'}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {todayState.reason === 'pushed'
                  ? 'Workout pushed for Smart Rest. Tomorrow is ready.'
                  : 'Choose the default seeded program to start the MVP loop.'}
              </p>
              {defaultProgram ? (
                <Button
                  className="w-full"
                  disabled={createEnrollment.isPending}
                  onClick={() => void createEnrollment.mutateAsync(defaultProgram.id)}
                >
                  Begin {defaultProgram.name}
                </Button>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            Biometric trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topTrends.length > 0 ? (
            topTrends.map((trend) => (
              <div className="flex items-center justify-between" key={trend.label}>
                <span className="text-sm text-muted-foreground">{trend.label}</span>
                <span className="text-sm font-medium">
                  {trend.latest} {trend.unit}
                  {trend.direction !== 'insufficient' ? ` (${trend.direction})` : ''}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Log optional biometrics for at least two days to see trends.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-start gap-3 pt-6">
          <Moon className="mt-0.5 size-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            Smart rest counts when it matches your readiness and includes a micro-commitment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
