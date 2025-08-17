-- Migration number: 0001 	 2025-01-31T00:42:00.000Z
--> statement-breakpoint
create table User (
  userId integer primary key,
  name text not null default '',
  email text not null unique,
  emailVerified integer not null default 0,
  image text,
  role text not null default 'user',
  banned integer not null default 0,
  banReason text,
  banExpires text,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now'))
);

--> statement-breakpoint
create table Session (
  sessionId integer primary key,
  expiresAt text not null,
  token text not null unique,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now')),
  ipAddress text,
  userAgent text,
  userId integer not null references User (userId),
  impersonatedBy integer references User (userId),
  activeOrganizationId integer references Organization (organizationId)
);

--> statement-breakpoint
create table Organization (
  organizationId integer primary key,
  name text not null,
  slug text not null unique,
  logo text,
  metadata text,
  createdAt text not null default (datetime('now'))
);

--> statement-breakpoint
create table Member (
  memberId integer primary key,
  userId integer not null references User (userid),
  organizationId integer not null references Organization (organizationId),
  role text not null,
  createdAt text not null default (datetime('now'))
);

--> statement-breakpoint
create table Invitation (
  invitationId integer primary key,
  email text not null,
  inviterId integer not null references User (userId),
  organizationId integer not null references Organization (organizationId),
  role text not null,
  status text not null,
  expiresAt text not null
);

--> statement-breakpoint
create table Account (
  accountId integer primary key,
  betterAuthAccountId text not null,
  providerId text not null,
  userId integer not null references User (userId),
  accessToken text,
  refreshToken text,
  idToken text,
  accessTokenExpiresAt text,
  refreshTokenExpiresAt text,
  scope text,
  password text,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now'))
);

--> statement-breakpoint
create table Verification (
  verificationId integer primary key,
  identifier text not null,
  value text not null,
  expiresAt text not null,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now'))
);

--> statement-breakpoint
insert into
  User (userId, name, email, role)
values
  (1, 'Admin', 'a@a.com', 'admin');

--> statement-breakpoint
insert into
  Account (
    accountId,
    betterAuthAccountId,
    providerId,
    userId,
    password
  )
values
  (1, '1', 'credential', 1, '');
