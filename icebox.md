# Future Development Ideas

## Nexus Social - Communities & Real-Time Chat
### FEATURE 1: Social Profiles & The Friend Graph
- Task 1.1: Develop Public User Profiles
  - Description: Allow users to claim a unique @username, upload an avatar, and choose what fitness data (e.g., current Bio-Sync streak, active program) is visible to the public or just friends.
  - Definition of Done (DoD): User can successfully update their profile and privacy settings. The database enforces unique usernames.

- Task 1.2: Implement Friend Request System
  - Description: Build the logic and UI to search for users by username, send a request, and accept/decline incoming requests.
  - DoD: Users can establish a bi-directional "Friend" relationship in the database, unlocking access to direct messaging.

- Task 1.3: Build App Store Compliance (Block/Report)
  - Description: Implement mandatory features required by iOS/Android guidelines for User Generated Content (UGC), allowing users to block others and report inappropriate accounts.
  - DoD: Blocked users can no longer search, view, or message the blocking user.

### FEATURE 2: Community Generation & Management
- Task 2.1: Implement Community Creation
  - Description: Allow users to create a "Nexus Community" (e.g., "5AM Lifters Club" or "Austin TX Runners"), setting a group name, description, and privacy level (Public or Invite-Only).
  - DoD: User can successfully instantiate a new group and is automatically assigned the "Admin" role in the database.

- Task 2.2: Build Group Invites & Roster Management
  - Description: Create the interface for Admins to generate invite links, approve join requests, and remove members from the community.
  - DoD: Roster accurately reflects current members, and non-members cannot access Invite-Only community data.

### FEATURE 3: Real-Time Chat System
- Task 3.1: Implement WebSockets for Real-Time Delivery
  - Description: Configure the backend (e.g., Supabase Realtime) to listen for database INSERT events on the "Messages" table and push them instantly to the connected clients.
  - DoD: Two users in a chat room see messages appear instantly without needing to refresh the screen.

- Task 3.2: Build Direct & Group Messaging Interfaces
  - Description: Develop the UI for 1-on-1 direct messages and multi-user community chat channels. Include basic chat features (timestamps, read receipts, sender avatars).
  - DoD: Users can send text payloads to individuals or groups, and the UI correctly renders the chronological chat history.

- Task 3.3: Integrate Push Notifications for Mentions/Messages
  - Description: Connect a service like Firebase Cloud Messaging (FCM) or Apple Push Notification service (APNs) to alert offline users of new direct messages or @mentions in a community.
  - DoD: User receives an OS-level lock screen notification when messaged while the app is backgrounded or closed.
