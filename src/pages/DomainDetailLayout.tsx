import { Outlet, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { domainsApi } from '@/api/domains'

export default function DomainDetailLayout() {
  const { domainId } = useParams({ from: '/domains/$domainId' })

  // Prefetch domain — result is available in Sidebar via cached query
  useQuery({
    queryKey: ['domains', domainId],
    queryFn: () => domainsApi.get(domainId),
    staleTime: 60_000,
  })

  return <Outlet />
}
