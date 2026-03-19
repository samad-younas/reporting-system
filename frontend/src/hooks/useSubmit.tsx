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

  const parseResponseBody = (rawBody: string) => {
    if (!rawBody) return null;
    try {
      return JSON.parse(rawBody);
    } catch {
      return { message: rawBody };
    }
  };

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

      const rawBody = await response.text();
      const res_data = parseResponseBody(rawBody);

      if (!response.ok) {
        const message = res_data?.message || "Submission failed";
        toast.error(message);
        throw new Error(message);
      }

      return res_data;
    },
  });

  return mutation;
};
