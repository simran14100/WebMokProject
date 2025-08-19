// Simple module to track app-level session flags
let userLoggingOut = false;

export function setUserLoggingOut(value) {
  userLoggingOut = Boolean(value);
}

export function isUserLoggingOut() {
  return userLoggingOut;
}
