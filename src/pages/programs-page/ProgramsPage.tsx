import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { usePublishedProgramsQuery } from '@/entities/program';
import {
  canSwitchProgram,
  ProgramSwitchBlockedError,
  useActiveEnrollmentQuery,
  useActiveWorkoutLogQuery,
  useEnrollOrSwitchProgramMutation,
} from '@/entities/workout-session';
import { useUserStore } from '@/entities/user';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/ui';

function programMeta(program: {
  level: string | null;
  specialty: string | null;
  days_per_week: number | null;
}) {
  return [program.level, program.specialty, program.days_per_week ? `${program.days_per_week}d/wk` : null]
    .filter(Boolean)
    .join(' · ');
}

export function ProgramsPage() {
  const navigate = useNavigate();
  const userId = useUserStore((s) => s.userId);
  const programsQuery = usePublishedProgramsQuery();
  const enrollmentQuery = useActiveEnrollmentQuery(userId);
  const activeLogQuery = useActiveWorkoutLogQuery(userId);
  const enrollOrSwitch = useEnrollOrSwitchProgramMutation(userId);

  const switchBlocked = !canSwitchProgram(activeLogQuery.data ?? null);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  async function handleEnroll(programId: string) {
    if (!isOnline) {
      toast.error('Connect to the internet to enroll in a program.');
      return;
    }

    try {
      await enrollOrSwitch.mutateAsync(programId);
      toast.success('Program updated.');
      void navigate('/');
    } catch (error) {
      if (error instanceof ProgramSwitchBlockedError) {
        toast.error(error.message);
        return;
      }
      toast.error('Could not update your program. Try again when your connection is stable.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Program library</h1>
        <p className="text-sm text-muted-foreground">
          Choose a training template to power today&apos;s session.
        </p>
      </div>

      {switchBlocked ? (
        <Alert>
          <AlertDescription>
            Finish or resume your in-progress workout before switching programs.{' '}
            <button
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => void navigate('/workout')}
              type="button"
            >
              Go to workout
            </button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!isOnline ? (
        <Alert>
          <AlertDescription>
            You can browse cached programs offline. Enrolling requires a connection.
          </AlertDescription>
        </Alert>
      ) : null}

      {programsQuery.isPending || enrollmentQuery.isPending ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : null}

      {programsQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Could not load programs.{' '}
            <button
              className="font-medium underline-offset-4 hover:underline"
              onClick={() => void programsQuery.refetch()}
              type="button"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      ) : null}

      {programsQuery.data?.map((program) => {
        const isCurrent = enrollmentQuery.data?.program_id === program.id;
        const ctaLabel = isCurrent
          ? 'Current program'
          : enrollmentQuery.data
            ? 'Switch to this program'
            : 'Enroll';

        return (
          <Card key={program.id}>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                {program.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{programMeta(program)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {program.description ? (
                <p className="text-sm text-muted-foreground">{program.description}</p>
              ) : null}
              <Button
                className="w-full"
                disabled={
                  isCurrent ||
                  switchBlocked ||
                  !isOnline ||
                  enrollOrSwitch.isPending
                }
                onClick={() => void handleEnroll(program.id)}
                variant={isCurrent ? 'outline' : 'default'}
              >
                {enrollOrSwitch.isPending ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  ctaLabel
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Button className="w-full" onClick={() => void navigate('/')} variant="outline">
        Back to dashboard
      </Button>
    </div>
  );
}
