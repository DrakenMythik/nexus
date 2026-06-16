import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimerReset } from 'lucide-react';
import { toast } from 'sonner';

import {
  useUpsertAdherenceEventMutation,
} from '@/entities/adherence';
import {
  evaluateNextTargetWeight,
  useExerciseProgressionsQuery,
  useUpsertExerciseProgressionMutation,
} from '@/entities/progression';
import {
  isLoggableBlock,
  useProgramWithWorkoutsQuery,
  usePublishedProgramsQuery,
} from '@/entities/program';
import { useUserStore } from '@/entities/user';
import {
  hasCompletedPrescribedSets,
  nextEnrollmentPosition,
  resolveTodayWorkoutState,
  selectDefaultProgram,
  useActiveEnrollmentQuery,
  useActiveWorkoutLogQuery,
  useFinishWorkoutLogMutation,
  useSetLogsQuery,
  useStartWorkoutLogMutation,
  useUpdateEnrollmentPositionMutation,
  useUpsertSetLogMutation,
} from '@/entities/workout-session';
import { formatLocalDate } from '@/shared/lib';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
} from '@/shared/ui';

export function WorkoutGuidedPage() {
  const navigate = useNavigate();
  const userId = useUserStore((state) => state.userId);
  const today = formatLocalDate();
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [customWeights, setCustomWeights] = useState<Record<string, string>>({});

  const programsQuery = usePublishedProgramsQuery();
  const enrollmentQuery = useActiveEnrollmentQuery(userId);
  const activeLogQuery = useActiveWorkoutLogQuery(userId);
  const defaultProgram = selectDefaultProgram(programsQuery.data ?? []);
  const programId = enrollmentQuery.data?.program_id ?? defaultProgram?.id;
  const programQuery = useProgramWithWorkoutsQuery(programId);
  const todayState = resolveTodayWorkoutState({
    program: programQuery.data,
    enrollment: enrollmentQuery.data ?? null,
    activeLog: activeLogQuery.data ?? null,
    today,
  });
  const activeLog = activeLogQuery.data;
  const workout =
    programQuery.data?.workouts.find((item) => item.id === activeLog?.workout_id) ??
    todayState.workout;
  const setLogsQuery = useSetLogsQuery(activeLog?.id ?? null);
  const progressionsQuery = useExerciseProgressionsQuery(userId);
  const startWorkout = useStartWorkoutLogMutation(userId);
  const logSet = useUpsertSetLogMutation(activeLog?.id ?? null);
  const finishWorkout = useFinishWorkoutLogMutation();
  const updateEnrollment = useUpdateEnrollmentPositionMutation();
  const upsertAdherence = useUpsertAdherenceEventMutation(userId);
  const upsertProgression = useUpsertExerciseProgressionMutation(userId);

  const loggableExercises = useMemo(
    () => workout?.exercises.filter((exercise) => isLoggableBlock(exercise.block_type)) ?? [],
    [workout],
  );

  const isLoading =
    programsQuery.isPending ||
    enrollmentQuery.isPending ||
    activeLogQuery.isPending ||
    programQuery.isPending;

  async function handleStart() {
    if (!userId || !workout) {
      return;
    }

    try {
      await startWorkout.mutateAsync({
        workoutId: workout.id,
        clientMutationId: `workout-${userId}-${workout.id}-${Date.now()}`,
      });
    } catch {
      toast.error('Could not start this workout.');
    }
  }

  async function handleLogSet(exerciseId: string) {
    if (!activeLog || !workout) {
      await handleStart();
      return;
    }

    const prescription = workout.exercises.find(
      (exercise) => exercise.exercise_id === exerciseId,
    );
    if (!prescription) {
      return;
    }

    const existingSets = (setLogsQuery.data ?? []).filter(
      (set) => set.exercise_id === exerciseId,
    );
    const setNumber = existingSets.length + 1;
    const progression = progressionsQuery.data?.find(
      (item) => item.exercise_id === exerciseId,
    );
    const weight = Number(customWeights[exerciseId] ?? progression?.target_weight ?? 20);
    const reps = prescription.target_reps_max ?? prescription.target_reps_min ?? 1;

    try {
      await logSet.mutateAsync({
        exerciseId,
        setNumber,
        repsCompleted: reps,
        weight,
        clientMutationId: `set-${activeLog.id}-${exerciseId}-${setNumber}`,
      });
      setRestRemaining(prescription.rest_seconds);
    } catch {
      toast.error('Could not save set. It will be easier to retry when online.');
    }
  }

  async function handleFinish() {
    if (!activeLog || !programQuery.data || !enrollmentQuery.data || !workout) {
      return;
    }

    const incomplete = loggableExercises.some(
      (exercise) =>
        !hasCompletedPrescribedSets(
          exercise.exercise_id,
          exercise.target_sets,
          (setLogsQuery.data ?? []).map((set) => ({
            exerciseId: set.exercise_id,
            setNumber: set.set_number,
            repsCompleted: set.reps_completed,
            weight: set.weight,
          })),
        ),
    );

    if (incomplete && !window.confirm('Some prescribed sets are incomplete. Finish anyway?')) {
      return;
    }

    try {
      await finishWorkout.mutateAsync(activeLog.id);
      await upsertAdherence.mutateAsync({
        eventDate: today,
        status: 'trained',
        source: 'workout_finish',
        workoutLogId: activeLog.id,
      });

      await Promise.all(
        loggableExercises.map((exercise) => {
          const progression = progressionsQuery.data?.find(
            (item) => item.exercise_id === exercise.exercise_id,
          );
          const targetWeight = progression?.target_weight ?? 20;
          const incrementWeight = progression?.increment_weight ?? 2.5;
          const targetReps = exercise.target_reps_max ?? exercise.target_reps_min ?? 1;
          const nextWeight = evaluateNextTargetWeight({
            targetWeight,
            incrementWeight,
            prescribedSets: exercise.target_sets,
            targetReps,
            completedSets: (setLogsQuery.data ?? [])
              .filter((set) => set.exercise_id === exercise.exercise_id)
              .map((set) => ({
                repsCompleted: set.reps_completed,
                weight: set.weight,
              })),
          });
          return upsertProgression.mutateAsync({
            exerciseId: exercise.exercise_id,
            targetWeight: nextWeight,
            incrementWeight,
          });
        }),
      );

      await updateEnrollment.mutateAsync({
        enrollmentId: enrollmentQuery.data.id,
        userId: activeLog.user_id,
        position: {
          ...nextEnrollmentPosition(programQuery.data, enrollmentQuery.data),
          pushed_until: null,
        },
      });

      toast.success('Workout complete. Progression updated.');
      navigate('/');
    } catch {
      toast.error('Could not finish workout yet.');
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!workout) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No workout queued</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Return to the dashboard to browse the program library and enroll in a plan.
          </p>
          <Button className="w-full" onClick={() => navigate('/')}>
            Back to dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{workout.name}</h1>
        <p className="text-sm text-muted-foreground">
          Week {workout.week_number}, day {workout.day_number}
        </p>
      </div>

      {!activeLog ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              Start this guided session to log sets and use rest timers.
            </p>
            <Button className="w-full" onClick={() => void handleStart()}>
              Start guided workout
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {restRemaining ? (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-2">
              <TimerReset className="size-5 text-primary" />
              <span className="text-sm font-medium">
                Rest {Math.ceil(restRemaining / 60)} min
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setRestRemaining(null)}>
              Skip
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {loggableExercises.map((exercise) => {
        const completed = (setLogsQuery.data ?? []).filter(
          (set) => set.exercise_id === exercise.exercise_id,
        ).length;
        const progression = progressionsQuery.data?.find(
          (item) => item.exercise_id === exercise.exercise_id,
        );
        const suggestedWeight = progression?.target_weight ?? 20;

        return (
          <Card key={exercise.id}>
            <CardHeader>
              <CardTitle>{exercise.exercise.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {completed}/{exercise.target_sets} sets logged ·{' '}
                {exercise.target_reps_min ?? exercise.target_time_seconds}
                {exercise.target_reps_max ? `-${exercise.target_reps_max}` : ''}{' '}
                {exercise.target_time_seconds ? 'sec' : 'reps'}
              </p>
              <div className="space-y-2">
                <Label htmlFor={`weight-${exercise.exercise_id}`}>
                  Target weight (kg)
                </Label>
                <Input
                  id={`weight-${exercise.exercise_id}`}
                  inputMode="decimal"
                  onChange={(event) =>
                    setCustomWeights((values) => ({
                      ...values,
                      [exercise.exercise_id]: event.target.value,
                    }))
                  }
                  value={customWeights[exercise.exercise_id] ?? String(suggestedWeight)}
                />
              </div>
              <Button
                className="w-full"
                disabled={completed >= exercise.target_sets || logSet.isPending}
                onClick={() => void handleLogSet(exercise.exercise_id)}
              >
                Complete next set
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Button className="w-full" disabled={!activeLog} onClick={() => void handleFinish()}>
        Finish workout
      </Button>
    </div>
  );
}
