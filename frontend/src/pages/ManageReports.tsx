import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, FileText } from "lucide-react";
import { SimpleDialog } from "@/components/ui/simple-dialog";
import ReportManageForm from "@/components/reports/ReportManageForm";
import type { Report } from "@/utils/exports";
import ReportTable from "@/components/reports/ReportTable";
// import { useFetch } from "@/hooks/useFetch";
// import { LoadingSpinner } from "@/components/public/LoadingSpinner";
// import { useSubmit } from "@/hooks/useSubmit";
import { toast } from "react-toastify";
import { reportCategories, reports as dummyReports } from "@/utils/exports";

const ManageReports: React.FC = () => {
  // --- Data Fetching ---
  // In a real scenario, this would fetch from the API.
  // For now, if the API isn't ready, it might return null/error.
  // We can fallback to local reports if needed, but let's stick to the pattern.
  // const { isPending, data: INITIAL_REPORTS } = useFetch({
  //   endpoint: "api/reports/all",
  //   isAuth: true,
  // });

  // --- Mutations ---
  // Mocking mutations for now as we are using dummy data
  /*
  const { isPending: isSubmitting, mutateAsync } = useSubmit({
    method: "POST",
    endpoint: "api/reports/store",
    isAuth: true,
  });

  const { isPending: isUpdating, mutateAsync: updateMutate } = useSubmit({
    method: "POST", // Method might be PUT depending on backend, using POST as per ManageUser
    endpoint: (data: any) => `api/reports/update/${data.id}`,
    isAuth: true,
  });

  const { isPending: isDeleting, mutateAsync: deleteMutate } = useSubmit({
    method: "DELETE",
    endpoint: (data: any) => `api/reports/delete/${data.id}`,
    isAuth: true,
  });
  */
  // Mock loading states
  const isSubmitting = false;
  const isUpdating = false;
  const isDeleting = false;

  // --- State ---
  const [reports, setReports] = useState<Report[]>(dummyReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  // Initialize reports from fetch
  /*
  useEffect(() => {
    if (INITIAL_REPORTS) {
      const reportsData = Array.isArray(INITIAL_REPORTS)
        ? INITIAL_REPORTS
        : INITIAL_REPORTS.data || [];
      setReports(reportsData);
    }
    // Fallback? If no API, we might want to show empty or handle it.
    // Assuming API exists or will exist.
  }, [INITIAL_REPORTS]);
  */

  // --- Filtering ---
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all"
        ? true
        : report.categoryId.toString() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // --- Handlers ---
  const handleCreateReport = () => {
    setEditingReport(null);
    setIsModalOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleDeleteReport = (id: number) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      setReportToDelete(report);
      setDeleteConfirmationOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      // Mock deletion
      // await deleteMutate({ id: reportToDelete.id });
      setReports(reports.filter((r) => r.id !== reportToDelete.id));
      toast.success("Report deleted successfully! (Mock)");
      setDeleteConfirmationOpen(false);
      setReportToDelete(null);
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const handleSubmitReport = async (formData: any) => {
    try {
      if (editingReport) {
        // Mock update
        const updatedReport = { ...formData, id: editingReport.id };

        setReports(
          reports.map((r) => (r.id === editingReport.id ? updatedReport : r)),
        );
        toast.success("Report updated successfully! (Mock)");
        setIsModalOpen(false);
      } else {
        // Mock create
        const newReport: Report = {
          ...formData, // Spread form data
          id: Date.now(), // Generate mock ID
        };
        setReports([...reports, newReport]);
        toast.success("Report created successfully! (Mock)");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save report");
    }
  };

  // if (isPending) {
  //   return <LoadingSpinner />;
  // }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Report Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and configure reports and their parameters.
          </p>
        </div>
        <Button onClick={handleCreateReport} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Report
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
        <div className="relative w-full sm:w-75">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search reports..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {reportCategories.map((cat) => (
            <option key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <ReportTable
        reports={filteredReports}
        onEdit={handleEditReport}
        onDelete={handleDeleteReport}
      />

      <SimpleDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReport ? "Edit Report" : "Create New Report"}
      >
        <ReportManageForm
          initialData={editingReport}
          onSubmit={handleSubmitReport}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting || isUpdating}
        />
      </SimpleDialog>

      <SimpleDialog
        isOpen={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete report{" "}
            <strong>{reportToDelete?.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Report"}
            </Button>
          </div>
        </div>
      </SimpleDialog>
    </div>
  );
};

export default ManageReports;
