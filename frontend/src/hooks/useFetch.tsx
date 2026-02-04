import { apiURL } from "@/utils/exports";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

interface UseFetchParams {
  endpoint?: string;
  isAuth?: boolean;
}

export const useFetch = ({ endpoint, isAuth = false }: UseFetchParams) => {
  const { token } = useSelector((state: any) => state.auth);

  const query = useQuery({
    queryKey: [endpoint, isAuth ? token : null],
    enabled: !!endpoint,
    queryFn: async () => {
      const response = await fetch(`${apiURL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(isAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const res_data = await response.json();

      if (!response.ok) {
        const message = res_data.message || "Fetch failed";
        toast.error(message);
        throw new Error(message);
      }

      return res_data;
    },
  });
  return query;
};
