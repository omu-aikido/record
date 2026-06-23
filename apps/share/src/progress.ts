import { timeForNextGrade } from './grade';

export type PromotionProgressProfile = {
  grade?: number | string | null;
  getGradeAt?: string | null;
  joinedAt?: number | null;
};

export type PromotionProgressActivity = {
  date?: string;
  period: number;
};

export type PromotionProgressSummary = {
  current: number;
  required: number;
  progress: number;
  isMet: boolean;
};

export function resolvePromotionSince(profile: PromotionProgressProfile | null | undefined): string {
  if (profile?.getGradeAt) {
    return profile.getGradeAt;
  }

  if (typeof profile?.joinedAt === 'number' && Number.isFinite(profile.joinedAt)) {
    return `${profile.joinedAt}-04-01`;
  }

  return '1970-01-01';
}

export function countPracticeDays(totalPeriod: number): number {
  return Math.floor(Math.max(0, totalPeriod) / 1.5);
}

export function buildPromotionProgressFromPracticeCount(
  grade: PromotionProgressProfile['grade'],
  current: number
): PromotionProgressSummary {
  const required = timeForNextGrade(grade ?? 0);
  const progress = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100;

  return {
    current,
    required,
    progress,
    isMet: current >= required,
  };
}

export function buildPromotionProgress(
  profile: PromotionProgressProfile | null | undefined,
  activities: PromotionProgressActivity[]
): PromotionProgressSummary {
  const since = resolvePromotionSince(profile);
  const totalPeriod = activities.reduce((sum, activity) => {
    return !activity.date || activity.date >= since ? sum + (activity.period || 0) : sum;
  }, 0);
  const current = countPracticeDays(totalPeriod);

  return buildPromotionProgressFromPracticeCount(profile?.grade, current);
}
