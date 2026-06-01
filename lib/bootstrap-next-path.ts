/** Full return path for /auth/bootstrap?next= (preserves mock_attempt and other query params). */
export function bootstrapNextPath(pathname: string, search: string): string {
  return search ? `${pathname}${search}` : pathname;
}
