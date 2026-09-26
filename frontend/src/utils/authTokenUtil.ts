export const saveAccessToken = (token: string): void => {
  localStorage.setItem("access_token", token);
};

export const saveRefreshToken = (token: string): void => {
  localStorage.setItem("refresh_token", token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refresh_token");
};

export const deleteAccessToken = (): void => {
  localStorage.removeItem("access_token");
};

export const deleteRefreshToken = (): void => {
  localStorage.removeItem("refresh_token");
};

export const clearTokens = (): void => {
  deleteAccessToken();
  deleteRefreshToken();
};
