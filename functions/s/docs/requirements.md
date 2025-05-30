# SaaS for SMBs Requirements

## User Authentication

- System supports both authenticated users and unauthenticated guests
- Guests can access public-facing content only
- Users must authenticate to access non-public features
- Each user has a unique email address

## User Types

- Users are either `customer` or `staffer` (mutually exclusive)
- Type is immutable after user creation
- Type determines application access:
  - Customers -> /app/\*
  - Staffers -> /admin/\*

## Customer Accounts

- Each customer owns exactly one account
- Accounts can have multiple members up to 5
- Members must be customers (staffers cannot be members)
- Account ownership is permanent and cannot be transferred
- Resources can be transferred between accounts as needed

## Account Subscriptions

- Each account may have one Stripe customer
- Each account may have one Stripe subscription
- Account owner's email must match Stripe customer email
- When user email changes, Stripe customer email must be updated to maintain synchronization

## Member Management

- Account owners can invite customers by email
  - Email must not belong to a staffer
  - Email must not belong to an existing account member
- When inviting a user:
  - Upsert user only if user type is customer.
  - Upsert must reactivate user if soft deleted (clear deletedAt)
  - Create account member with 'pending' status
  - Send invitation email
- Edge cases to handle:
  - Preventing staffers from being invited
  - Preventing duplicate invitations
  - Proper handling of soft-deleted users
- An account member has a status
  - pending - Awaiting acceptance
  - active - Current member
- Membership actions:
  - Owners can revoke a member's access (hard deletes the membership record)
  - Members can leave an account (hard deletes the membership record)
  - Owners can invite a previously removed member again (creates a new membership record)

## Role-Based Access Control

- Account members are assigned one of the following roles. These roles are defined by a specific set of granular permissions detailed below:

  - admin
  - member

  ### Permissions Catalogue (Customer Accounts)

  This catalogue lists the granular permissions available for customer accounts. Roles are composed of these permissions.

  **Account Management (`account`)**

  - The 'admin' role has full capabilities for managing account settings.

  **Member Management (`member`)**

  - `member:read_list` - View the list of account members, their roles, and statuses.
  - `member:invite` - Invite new customers to become account members.
  - `member:revoke` - Remove an existing member from the account.
  - `member:edit_role` - Change the role of an existing account member.
  - `member:leave_account` - Allows a member to leave the account they are part of.

  **Billing Management (`billing`)**

  - The 'admin' role has full capabilities for managing billing, subscriptions, and invoices.

  ### Role Definitions (Customer Account Members)

  Each role grants a specific set of permissions from the catalogue:

  - **admin** - Grants full account and billing management capabilities, plus the following member management permissions:
    - `member:read_list`
    - `member:invite`
    - `member:revoke`
    - `member:edit_role`
  - **member** - Grants the following permissions:
    - `member:read_list` (To see collaborators)
    - `account:read_settings` (To view non-sensitive account information)

- Access scope:

  - All roles are scoped to the entire account
  - Fine-grained resource-level permissions deferred for future implementation

- Authorization checks:
  - API endpoints should verify member role (and thereby their permissions) before allowing actions.
  - UI should conditionally render elements based on user's role (and thereby their permissions).

## User Deletion Strategy

- Users must be soft-deleted rather than hard-deleted due to Stripe integration requirements
- Upon soft deletion of user, all AccountMembers for that user must be hard deleted, but the Account is untouched.
- Soft deletion is implemented using `deletedAt` timestamp in the User record
- Email addresses must remain unique across all users (including soft-deleted users)
- When a user attempts to register with an email that belongs to a soft-deleted user:
  - The system will reactivate the soft-deleted user record and insert AccountMember record.
  - This maintains the connection to existing Stripe customer records
  - All existing account relationships are preserved
  - Upserting a user who is a customer must reactivate if soft-deleted (clear deletedAt)
- Email change process:
  - When a user changes their email, the corresponding Stripe customer email must be updated
  - System must ensure email synchronization between User and Stripe customer

## Data Integrity Constraints

- Account ownership is permanent but resources can be transferred
- Stripe customers and subscriptions are permanently linked to accounts
- Financial records must be preserved even when users are deleted
- Queries for active users must include `WHERE deletedAt IS NULL` conditions

## Staffers Access

- Staffers operate the administrative application
- Staffers cannot be account members
- Staffers cannot access /app/\*

## Policy System

- A Policy is a rule or set of conditions that determines if a user is permitted to perform an action or access a resource, often by evaluating required permissions.
- **Permission**: A specific, granular capability within the system, typically expressed in a `domain:action` format (e.g., `account:manage_members`, `billing:view_invoices`, `content:edit`).
  - Permissions form the fundamental units of access control.
  - User roles (e.g., admin, editor, viewer) will be defined by the set of permissions they grant.

## Deferred Requirements

- [ ] Soft delete implementation
- [ ] Permission levels structure
- [ ] Role hierarchy (if needed beyond capabilities)
- [ ] Member invitation expiration
- [ ] Member removal process
- [ ] Multi-account resource transfer UI
- [ ] Audit logs for membership status changes

## Reference

- https://developers.cloudflare.com/fundamentals/setup/manage-members/policies/
- https://developers.cloudflare.com/fundamentals/setup/manage-members/roles/
- https://developers.cloudflare.com/fundamentals/setup/manage-members/scope/
