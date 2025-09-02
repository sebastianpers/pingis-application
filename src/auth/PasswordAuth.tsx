const keyFor = (scope: string) => `pw:authorized:${scope}`;

export function getScopeAuthorized(scope: string): boolean {
  return sessionStorage.getItem(keyFor(scope)) === "1";
}

export function setScopeAuthorized(scope: string, value: boolean): void {
  if (value) sessionStorage.setItem(keyFor(scope), "1");
  else sessionStorage.removeItem(keyFor(scope));
}

export function clearScopeAuthorization(scope = "settings"): void {
  sessionStorage.removeItem(keyFor(scope));
}
