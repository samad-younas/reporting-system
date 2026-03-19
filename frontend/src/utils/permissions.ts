import type { Report, ReportCategory } from "./exports";

type PermissionCarrier = {
  permission_key?: string;
  key?: string;
  name?: string;
  is_allowed?: boolean;
};

const normalizeRole = (role: string): string => role.trim().toLowerCase();

const roleAliases = (role: string): string[] => {
  const normalized = normalizeRole(role);

  if (normalized === "admin") return ["admin", "super-admin", "superadmin"];
  if (normalized === "super-admin" || normalized === "superadmin") {
    return ["super-admin", "superadmin", "admin"];
  }

  return [normalized];
};

const normalizePermissionList = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .flatMap((entry) => {
      if (typeof entry === "string") return [entry];
      if (entry && typeof entry === "object") {
        const item = entry as PermissionCarrier;
        if (item.is_allowed === false) return [];
        return [item.permission_key || item.key || item.name || ""];
      }
      return [];
    })
    .map((key) => key.trim())
    .filter(Boolean);
};

export const getUserPermissions = (userdata: any): string[] => {
  if (!userdata) return [];

  const direct = normalizePermissionList(userdata.permissions);
  if (direct.length) return direct;

  const fromRoles = Array.isArray(userdata.roles)
    ? userdata.roles.flatMap((role: any) =>
        normalizePermissionList(role?.permissions),
      )
    : [];

  return Array.from(new Set(fromRoles));
};

export const hasPermission = (userdata: any, permission: string): boolean => {
  if (!permission) return true;

  const userPermissions = getUserPermissions(userdata);
  return userPermissions.includes(permission);
};

export const hasAnyPermission = (
  userdata: any,
  permissions: string[] | undefined,
): boolean => {
  if (!permissions || permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(userdata, permission));
};

export const checkPermission = (
  item: Report | ReportCategory,
  userdata: any, // Typed loosely as any in app, but structure is UserData
) => {
  if (!userdata) return false;

  // Legacy super-admin compatibility
  if (
    normalizeRole(userdata.user_type || "") === "super-admin" ||
    normalizeRole(userdata.role || "") === "super-admin"
  ) {
    return true;
  }

  if (
    Array.isArray(item.requiredPermissions) &&
    item.requiredPermissions.length > 0
  ) {
    if (!hasAnyPermission(userdata, item.requiredPermissions)) {
      return false;
    }
  }

  const profile = userdata.profile || {};

  // Legacy role fallback for local mock data
  if (item.allowedRoles && item.allowedRoles.length > 0) {
    const roleNames = [
      userdata.user_type,
      userdata.role,
      ...(Array.isArray(userdata.roles)
        ? userdata.roles.map((r: any) => r.role_name || r.name).filter(Boolean)
        : []),
    ]
      .filter(Boolean)
      .flatMap((role) => roleAliases(String(role)));

    const normalizedAllowedRoles = item.allowedRoles
      .map((role) => normalizeRole(role))
      .flatMap((role) => roleAliases(role));

    const hasRole = normalizedAllowedRoles.some((allowed) =>
      roleNames.includes(allowed),
    );
    if (!hasRole) return false;
  }

  // Geographic Checks
  // 1. Location (Legacy/Generic)
  if (item.allowedLocations && item.allowedLocations.length > 0) {
    // Check against state or region or city if it matches any
    const userLocs = [profile.state, profile.city, profile.region].filter(
      Boolean,
    );
    const hasMatch = item.allowedLocations.some((loc) =>
      userLocs.includes(loc),
    );
    if (!hasMatch) return false;
  }

  // 2. Exact Hierarchy Checks
  if (item.allowedCountries && item.allowedCountries.length > 0) {
    if (!item.allowedCountries.includes(profile.country)) return false;
  }
  if (item.allowedRegions && item.allowedRegions.length > 0) {
    if (!item.allowedRegions.includes(profile.region)) return false;
  }
  if (item.allowedStates && item.allowedStates.length > 0) {
    if (!item.allowedStates.includes(profile.state)) return false;
  }
  if (item.allowedCities && item.allowedCities.length > 0) {
    if (!item.allowedCities.includes(profile.city)) return false;
  }
  if (item.allowedCostCenters && item.allowedCostCenters.length > 0) {
    if (!item.allowedCostCenters.includes(profile.costCenter)) return false;
  }

  return true;
};
