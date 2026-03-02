import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ViewMode = "cards" | "list" | "details";
export type SortBy = "name" | "prefix" | "category" | "subcategory";

interface ReportState {
  // Hierarchy selection
  selectedGroupId: number | null; // Main Group (e.g. Report Library)
  selectedCategoryId: number | null; // Report Category (e.g. Sales)
  selectedSubcategoryId: number | null; // Subcategory (e.g. Customer)
  selectedReportId: number | null;
  // Dashboard controls
  searchTerm: string;
  viewMode: ViewMode;
  sortBy: SortBy;
}

const initialState: ReportState = {
  selectedGroupId: 1, // default to "Report Library"
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  selectedReportId: null,
  searchTerm: "",
  viewMode: "cards",
  sortBy: "prefix",
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setSelectedGroupId: (state, action: PayloadAction<number | null>) => {
      state.selectedGroupId = action.payload;
      state.selectedCategoryId = null;
      state.selectedSubcategoryId = null;
      state.selectedReportId = null;
    },
    setSelectedCategoryId: (state, action: PayloadAction<number | null>) => {
      state.selectedCategoryId = action.payload;
      state.selectedSubcategoryId = null;
      state.selectedReportId = null;
    },
    setSelectedSubcategoryId: (state, action: PayloadAction<number | null>) => {
      state.selectedSubcategoryId = action.payload;
      state.selectedReportId = null;
    },
    setSelectedReportId: (state, action: PayloadAction<number | null>) => {
      state.selectedReportId = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
    },
    resetReportSelection: (state) => {
      state.selectedGroupId = 1;
      state.selectedCategoryId = null;
      state.selectedSubcategoryId = null;
      state.selectedReportId = null;
    },
    // kept for backward-compat callers that still pass string sub-category
    setSelectedSubCategory: (_state, _action: PayloadAction<string | null>) => {
      // no-op – callers should migrate to setSelectedSubcategoryId
    },
  },
});

export const {
  setSearchTerm,
  setSelectedGroupId,
  setSelectedCategoryId,
  setSelectedSubcategoryId,
  setSelectedSubCategory,
  setSelectedReportId,
  setViewMode,
  setSortBy,
  resetReportSelection,
} = reportSlice.actions;
export default reportSlice.reducer;
