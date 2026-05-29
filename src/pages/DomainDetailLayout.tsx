import { Outlet, useParams } from '@tanstack/react-router'
import { useDomainQuery } from '@/hooks/useDomains'

export default function DomainDetailLayout() {
  const { domainId } = useParams({ from: '/domains/$domainId' })

  // Prefetch domain — result available in Sidebar via shared query cache
  useDomainQuery(domainId)

  return <Outlet />
}
