import { ResourceList } from './ResourceList'

export function InboxPage() {
  return (
    <ResourceList
      description="Resources you have captured but not organized into a collection yet."
      emptyDescription="New captures land here until you file them into a collection."
      emptyTitle="Your Inbox is empty"
      inboxOnly
      title="Inbox"
    />
  )
}
