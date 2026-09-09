import type { PlatformRole } from "../types";

/**
 * Roles are hierarchical and mirror the backend exactly: a requirement names
 * the lowest role that passes, so asking for ADMIN also admits SUPER_ADMIN.
 */
const LEVELS: Record<PlatformRole, number> = {
  OPERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const covers = (
  role: PlatformRole | null | undefined,
  required: PlatformRole
): boolean => {
  if (!role) return false;
  return (LEVELS[role] ?? 0) >= LEVELS[required];
};

export const isOperatorOnly = (role: PlatformRole | null | undefined): boolean =>
  role === "OPERATOR";

/** Translation key for a role label. */
export const roleLabelKey = (role: PlatformRole): string => `role.${role}`;
