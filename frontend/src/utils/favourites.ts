import type { Report } from "@/utils/exports";

const FAV_STORAGE_KEY = "ssr:favourite-report-ids";
const RECENT_STORAGE_KEY = "ssr:recent-report-ids";

const parseIds = (value: string | null): number[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => Number.isInteger(id));
  } catch {
    return [];
  }
};

export const getFavouriteReportIds = (): number[] => {
  return parseIds(localStorage.getItem(FAV_STORAGE_KEY));
};

export const isFavouriteReport = (reportId: number): boolean => {
  return getFavouriteReportIds().includes(reportId);
};

export const toggleFavouriteReport = (reportId: number): number[] => {
  const current = getFavouriteReportIds();
  const updated = current.includes(reportId)
    ? current.filter((id) => id !== reportId)
    : [reportId, ...current];

  localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getFavouriteReports = (allReports: Report[]): Report[] => {
  const ids = getFavouriteReportIds();
  const map = new Map(allReports.map((report) => [report.id, report]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Report[];
};

export const addRecentReport = (reportId: number): number[] => {
  const current = parseIds(localStorage.getItem(RECENT_STORAGE_KEY));
  const updated = [reportId, ...current.filter((id) => id !== reportId)].slice(
    0,
    30,
  );
  localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const getRecentReports = (allReports: Report[]): Report[] => {
  const ids = parseIds(localStorage.getItem(RECENT_STORAGE_KEY));
  const map = new Map(allReports.map((report) => [report.id, report]));
  return ids.map((id) => map.get(id)).filter(Boolean) as Report[];
};
