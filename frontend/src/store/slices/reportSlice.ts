import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ReportState {
  selectedCategoryId: number | null;
  selectedSubCategory: string | null;
  selectedReportId: number | null;
  searchTerm: string;
}

const initialState: ReportState = {
  selectedCategoryId: null,
  selectedSubCategory: null,
  selectedReportId: null,
  searchTerm: "",
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setSelectedCategoryId: (state, action: PayloadAction<number | null>) => {
      state.selectedCategoryId = action.payload;
      state.selectedSubCategory = null;
      state.selectedReportId = null;
    },
    setSelectedSubCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedSubCategory = action.payload;
      state.selectedReportId = null;
    },
    setSelectedReportId: (state, action: PayloadAction<number | null>) => {
      state.selectedReportId = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    resetReportSelection: (state) => {
      state.selectedCategoryId = null;
      state.selectedReportId = null;
    },
  },
});

export const {
  setSearchTerm,
  setSelectedCategoryId,
  setSelectedSubCategory,
  setSelectedReportId,
  resetReportSelection,
} = reportSlice.actions;
export default reportSlice.reducer;
