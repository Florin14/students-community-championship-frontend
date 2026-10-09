export const isValidAudience = (value: string) =>
  value === "" ||
  (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 2147483647);
