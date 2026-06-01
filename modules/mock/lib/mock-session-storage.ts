/** Session key for active mock_attempt id per mock test. */
export function mockAttemptStorageKey(mockTestId: string): string {
  return `bf-mock-attempt-${mockTestId}`;
}
