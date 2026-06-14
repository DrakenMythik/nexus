import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useDailyBiometricsQuery,
  useUpsertDailyBiometricsMutation,
  validateDailyBiometricsInput,
  type DailyBiometricsInput,
} from '@/entities/daily-biometrics';
import {
  readinessBand,
} from '@/entities/adherence';
import {
  selectTodaysNudge,
  useKnowledgeNudgesQuery,
  useRecordNudgeSeenMutation,
  useUserNudgeHistoryQuery,
} from '@/entities/knowledge-nudge';
import { useUserStore } from '@/entities/user';
import { enqueueOfflineMutation, formatLocalDate } from '@/shared/lib';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/shared/ui';

type RitualStep = 'vibe' | 'biometrics' | 'nudge';

const optionalFieldLabels = {
  sleepHours: 'Sleep hours',
  calories: 'Calories',
  proteinG: 'Protein (g)',
  bodyWeight: 'Body weight (kg)',
  steps: 'Steps',
} satisfies Partial<Record<keyof DailyBiometricsInput, string>>;

function optionalNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

export function DailyRitualPage() {
  const navigate = useNavigate();
  const userId = useUserStore((state) => state.userId);
  const today = formatLocalDate();
  const [step, setStep] = useState<RitualStep>('vibe');
  const [readinessScore, setReadinessScore] = useState('7');
  const [pendingOffline, setPendingOffline] = useState(false);
  const [optionalValues, setOptionalValues] = useState({
    sleepHours: '',
    calories: '',
    proteinG: '',
    bodyWeight: '',
    steps: '',
  });

  const dailyQuery = useDailyBiometricsQuery(userId, today);
  const nudgeQuery = useKnowledgeNudgesQuery();
  const historyQuery = useUserNudgeHistoryQuery(userId);
  const upsertDaily = useUpsertDailyBiometricsMutation(userId);
  const recordNudgeSeen = useRecordNudgeSeenMutation(userId);

  const effectiveReadiness =
    dailyQuery.data?.readiness_score ?? Number(readinessScore);
  const preferredCategories =
    readinessBand(effectiveReadiness) === 'rest'
      ? ['Recovery', 'Sleep']
      : ['Strength', 'Nutrition'];

  const todaysNudge = useMemo(
    () =>
      selectTodaysNudge(
        nudgeQuery.data ?? [],
        historyQuery.data ?? [],
        preferredCategories,
      ),
    [historyQuery.data, nudgeQuery.data, preferredCategories],
  );

  const currentStep: RitualStep = dailyQuery.data?.readiness_score
    ? step === 'vibe'
      ? 'nudge'
      : step
    : step;

  async function saveDailyBiometrics(skipOptional: boolean) {
    const input: DailyBiometricsInput = {
      logDate: today,
      readinessScore: Number(readinessScore),
      sleepHours: skipOptional ? null : optionalNumber(optionalValues.sleepHours),
      calories: skipOptional ? null : optionalNumber(optionalValues.calories),
      proteinG: skipOptional ? null : optionalNumber(optionalValues.proteinG),
      bodyWeight: skipOptional ? null : optionalNumber(optionalValues.bodyWeight),
      steps: skipOptional ? null : optionalNumber(optionalValues.steps),
    };

    const validation = validateDailyBiometricsInput(input);
    if (!validation.valid) {
      toast.error(Object.values(validation.errors)[0] ?? 'Check your entries.');
      return;
    }

    if (!navigator.onLine) {
      enqueueOfflineMutation({
        id: `daily-${userId}-${today}`,
        mutationType: 'daily-biometrics',
        payload: input,
      });
      setPendingOffline(true);
      setStep('nudge');
      return;
    }

    try {
      await upsertDaily.mutateAsync(input);
      setStep('nudge');
    } catch {
      enqueueOfflineMutation({
        id: `daily-${userId}-${today}`,
        mutationType: 'daily-biometrics',
        payload: input,
      });
      setPendingOffline(true);
      setStep('nudge');
    }
  }

  function handleVibeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = {
      logDate: today,
      readinessScore: Number(readinessScore),
    };
    const validation = validateDailyBiometricsInput(input);
    if (!validation.valid) {
      toast.error(validation.errors.readinessScore);
      return;
    }
    setStep('biometrics');
  }

  async function handleNudgeContinue() {
    if (todaysNudge && navigator.onLine) {
      await recordNudgeSeen.mutateAsync(todaysNudge.id);
    } else if (todaysNudge) {
      enqueueOfflineMutation({
        id: `nudge-${userId}-${todaysNudge.id}`,
        mutationType: 'nudge-history',
        payload: { nudgeId: todaysNudge.id, seenAt: new Date().toISOString() },
      });
    }
    navigate('/');
  }

  return (
    <div className="space-y-4">
      {pendingOffline ? (
        <Alert>
          <AlertDescription>
            Saved locally. Nexus will sync this ritual when you are back online.
          </AlertDescription>
        </Alert>
      ) : null}

      {currentStep === 'vibe' ? (
        <Card>
          <CardHeader>
            <CardTitle>Vibe check</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleVibeSubmit}>
              <div className="space-y-2">
                <Label htmlFor="readiness">Readiness today (1-10)</Label>
                <Input
                  id="readiness"
                  min={1}
                  max={10}
                  name="readiness"
                  onChange={(event) => setReadinessScore(event.target.value)}
                  type="number"
                  value={readinessScore}
                />
              </div>
              <Button className="w-full" type="submit">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 'biometrics' ? (
        <Card>
          <CardHeader>
            <CardTitle>Optional biometrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(optionalFieldLabels).map(([key, label]) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    inputMode="decimal"
                    onChange={(event) =>
                      setOptionalValues((values) => ({
                        ...values,
                        [key]: event.target.value,
                      }))
                    }
                    value={optionalValues[key as keyof typeof optionalValues]}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  disabled={upsertDaily.isPending}
                  onClick={() => void saveDailyBiometrics(true)}
                  type="button"
                  variant="outline"
                >
                  Skip
                </Button>
                <Button
                  disabled={upsertDaily.isPending}
                  onClick={() => void saveDailyBiometrics(false)}
                  type="button"
                >
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {currentStep === 'nudge' ? (
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s knowledge nudge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysNudge ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary">
                  {todaysNudge.category}
                </p>
                <h2 className="text-xl font-semibold tracking-tight">
                  {todaysNudge.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {todaysNudge.content}
                </p>
                {todaysNudge.source_citation ? (
                  <p className="text-xs text-muted-foreground">
                    Source: {todaysNudge.source_citation}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No nudges are available yet. You can still continue to your dashboard.
              </p>
            )}
            <Button className="w-full" onClick={() => void handleNudgeContinue()}>
              Open dashboard
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
