import type { Report, ReportCategory } from "./exports";

export const checkPermission = (
  item: Report | ReportCategory,
  userdata: any,
) => {
  if (!userdata) return true;

  if (
    userdata.user_type === "super-admin" &&
    userdata.profile.state === "New York"
  ) {
    return true;
  }

  if (item.allowedRoles && item.allowedRoles.length > 0) {
    if (!item.allowedRoles.includes(userdata.user_type)) return false;
  }
  if (item.allowedLocations && item.allowedLocations.length > 0) {
    if (!item.allowedLocations.includes(userdata.profile.state)) return false;
  }
  return true;
};
