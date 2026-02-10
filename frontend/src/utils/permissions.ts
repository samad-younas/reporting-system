import type { Report, ReportCategory } from "./exports";

interface UserProfile {
  country?: string;
  region?: string;
  state?: string;
  city?: string;
  costCenter?: string;
  role?: string;
}

interface UserData {
  user_type: string;
  profile: UserProfile;
}

export const checkPermission = (
  item: Report | ReportCategory,
  userdata: any, // Typed loosely as any in app, but structure is UserData
) => {
  if (!userdata) return true; // Fail safe or default allow/deny depending on policy. Assuming true for dev.

  // Super Admin Bypass
  if (userdata.user_type === "super-admin") {
    return true;
  }

  const profile = userdata.profile || {};

  // Role Check
  if (item.allowedRoles && item.allowedRoles.length > 0) {
    if (!item.allowedRoles.includes(userdata.user_type)) return false;
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
