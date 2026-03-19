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

  const getErrorMessage = (resData: any): string => {
    if (!resData) return "Submission failed";
    if (typeof resData?.message === "string" && resData.message.trim()) {
      return resData.message;
    }

    const errors = resData?.errors;
    if (errors && typeof errors === "object") {
      const firstKey = Object.keys(errors)[0];
      const firstVal = firstKey ? errors[firstKey] : null;
      if (Array.isArray(firstVal) && firstVal.length > 0) {
        return String(firstVal[0]);
      }
      if (typeof firstVal === "string" && firstVal.trim()) {
        return firstVal;
      }
    }

    return "Submission failed";
  };

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
      const hasBody = data !== undefined;
      const response = await fetch(`${apiURL}${finalEndpoint}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(isAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(hasBody ? { body: JSON.stringify(data) } : {}),
      });

      const rawBody = await response.text();
      const res_data = parseResponseBody(rawBody);

      if (!response.ok) {
        const message = getErrorMessage(res_data);
        toast.error(message);
        throw new Error(message);
      }

      return res_data;
    },
  });

  return mutation;
};
