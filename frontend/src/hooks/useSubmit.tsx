import { apiURL } from "../utils/exports";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

interface UseSubmitParams {
  method?: string;
  endpoint?: string | ((data: any) => string);
  isAuth?: boolean;
}

export const useSubmit = ({
  method = "POST",
  endpoint,
  isAuth = false,
}: UseSubmitParams) => {
  const { token } = useSelector((state: any) => state.auth);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const finalEndpoint =
        typeof endpoint === "function" ? endpoint(data) : endpoint;
      const response = await fetch(`${apiURL}${finalEndpoint}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...(isAuth && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      const res_data = await response.json();

      if (!response.ok) {
        toast.error(res_data.message || "Submission failed");
        return;
      }

      return res_data;
    },
  });

  return mutation;
};
