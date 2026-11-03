import { ResourceList } from './ResourceList'

export function ResourceListPage() {
  return (
    <ResourceList
      description="Everything you have captured, newest first."
      emptyDescription="Capture your first link, note, or snippet to see it here."
      emptyTitle="Nothing saved yet"
      title="All resources"
    />
  )
}
