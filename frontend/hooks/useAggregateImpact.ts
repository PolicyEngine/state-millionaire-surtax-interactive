import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AggregateRequest } from '@/lib/types';

export function useAggregateImpact(
  request: AggregateRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['aggregate-impact', request],
    queryFn: () => api.calculateAggregateImpact(request),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes (aggregate calcs are expensive)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}
