import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ReportState {
  selectedCategoryId: number | null;
  selectedReportId: number | null;
}

const initialState: ReportState = {
  selectedCategoryId: null,
  selectedReportId: null,
};

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {
    setSelectedCategoryId: (state, action: PayloadAction<number | null>) => {
      state.selectedCategoryId = action.payload;
      // Reset report when category changes
      state.selectedReportId = null;
    },
    setSelectedReportId: (state, action: PayloadAction<number | null>) => {
      state.selectedReportId = action.payload;
    },
    resetReportSelection: (state) => {
      state.selectedCategoryId = null;
      state.selectedReportId = null;
    },
  },
});

export const {
  setSelectedCategoryId,
  setSelectedReportId,
  resetReportSelection,
} = reportSlice.actions;
export default reportSlice.reducer;
