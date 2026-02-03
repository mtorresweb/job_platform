import { useQuery } from "@tanstack/react-query";
import { API_CONFIG, API_ENDPOINTS } from "@/shared/constants/api";

interface DashboardStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  // Add more stats as needed
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ANALYTICS.DASHBOARD}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await response.json();
      return data.data;
    },
  });
}

// You can add more stats-related hooks here
