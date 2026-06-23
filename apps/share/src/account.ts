import { Role } from './role';
import { type } from 'arktype';

export const AccountMetadata = type({
  role: Role.type,
  grade: '((string.numeric.parse |> -5 <= number.integer <= 5) | -5 <= number.integer <= 5) | null',
  getGradeAt: "/^\\d{4}-\\d{2}-\\d{2}$/ | null | ''",
  joinedAt: '((string.numeric.parse |> 2020 <= number.integer <= 9999) | 2020 <= number.integer <= 9999) | null',
  year: '/^(b[1-4]|m[1-2]|d[1-2])$/ | null | ""',
  birthday: "/^\\d{4}-\\d{2}-\\d{2}$/ | null | ''",
  '+': 'delete',
});

export const AccountInfo = type({
  firstName: '(string | undefined)?',
  lastName: '(string | undefined)?',
  username: '(string | undefined)?',
  profileImage: '(unknown)?',
});

export type AccountMetadataType = typeof AccountMetadata.infer;

export function isProfileComplete(profile: AccountMetadataType | null | undefined): boolean {
  if (!profile) return false;

  return (
    typeof profile.grade === 'number' &&
    typeof profile.joinedAt === 'number' &&
    typeof profile.year === 'string' &&
    profile.year.length > 0 &&
    typeof profile.birthday === 'string' &&
    profile.birthday.length > 0
  );
}

export function formatDateSlash(value: string | null | undefined): string {
  if (!value) return '-';

  const datePart = value.trim().match(/^\d{4}-\d{2}-\d{2}/u)?.[0];
  if (!datePart) return '-';

  return datePart.split('-').join('/');
}
