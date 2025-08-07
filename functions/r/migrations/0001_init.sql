-- Migration number: 0001 	 2025-01-31T00:42:00.000Z
--> statement-breakpoint
create table User (
  id integer primary key,
  name text not null default '',
  email text not null unique,
  emailVerified integer not null,
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
  id integer primary key,
  expiresAt text not null,
  token text not null unique,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now')),
  ipAddress text,
  userAgent text,
  userId integer not null references User (id),
  impersonatedBy integer references User (id),
  activeOrganizationId integer references Organization (id)
);

--> statement-breakpoint
create table Organization (
  id integer primary key,
  name text not null,
  slug text not null unique,
  logo text,
  metadata text,
  createdAt text not null default (datetime('now'))
);

--> statement-breakpoint
create table Member (
  id integer primary key,
  userId integer not null references User (id),
  organizationId integer not null references Organization (id),
  role text not null,
  createdAt text not null default (datetime('now'))
);

--> statement-breakpoint
create table Invitation (
  id integer primary key,
  email text not null,
  inviterId integer not null references User (id),
  organizationId integer not null references Organization (id),
  role text not null,
  status text not null,
  expiresAt text not null
);

--> statement-breakpoint
create table Account (
  id integer primary key,
  betterAuthAccountId text not null,
  providerId text not null,
  userId integer not null references User (id),
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
  id integer primary key,
  identifier text not null,
  value text not null,
  expiresAt text not null,
  createdAt text not null default (datetime('now')),
  updatedAt text not null default (datetime('now'))
);

--> statement-breakpoint
insert into
  User (id, name, email, emailVerified, role)
values
  (1, 'Admin', 'a@a.com', 1, 'admin');

--> statement-breakpoint
insert into
  Account (
    id,
    betterAuthAccountId,
    providerId,
    userId,
    password
  )
values
  (1, '1', 'credential', 1, 'MUST_CHANGE_PASSWORD');
