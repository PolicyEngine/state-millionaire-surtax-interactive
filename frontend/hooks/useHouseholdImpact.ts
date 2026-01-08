import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { HouseholdRequest } from '@/lib/types';

export function useHouseholdImpact(
  request: HouseholdRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['household-impact', request],
    queryFn: () => api.calculateHouseholdImpact(request),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
