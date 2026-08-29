import { UserWithPermissionsRead } from '#/system/user';

export function isUserWithPermissionsRead(obj: unknown): obj is UserWithPermissionsRead {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const user = obj as UserWithPermissionsRead;
  return (
    typeof user.id === 'string' &&
    (typeof user.profile_image_url === 'string' ||
      user.profile_image_url === null ||
      user.profile_image_url === undefined) &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string' &&
    typeof user.role_label === 'string' &&
    Array.isArray(user.permissions)
  );
}
