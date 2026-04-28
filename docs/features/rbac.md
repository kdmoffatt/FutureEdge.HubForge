# Feature: RBAC (Users, Roles, Permissions)

## Purpose and Scope

RBAC provides tenant-scoped authorization with users, roles, permissions, and role assignments.

## Installation via CLI

RBAC support is generated in full template baseline.

## Database Schema

Core models:

- `User`
- `Membership`
- `Role`
- `Permission`
- `RolePermission`
- `UserRole`

## API Endpoints

Users:

- `GET /v1/users`
- `POST /v1/users`
- `PUT /v1/users/:userId`
- `DELETE /v1/users/:userId`

Role assignment:

- `POST /v1/user-roles`
- `DELETE /v1/user-roles/:id`

Roles:

- `GET /v1/roles`
- `POST /v1/roles`
- `PUT /v1/roles/:roleId`
- `DELETE /v1/roles/:roleId`

Permissions:

- `GET /v1/permissions`
- `POST /v1/permissions`
- `PUT /v1/permissions/:permissionId`
- `DELETE /v1/permissions/:permissionId`

## Portal UI

Portal routes include users, roles, and permissions management pages.

## Settings and Configuration

Permission defaults are synchronized by `PermissionRegistry.syncToDatabase()`.

## Seeding

Seed creates an admin user, admin role, and initial permission assignments.

## Extension Points

- Add module-specific permissions by updating permission registry defaults
- Add finer-grained actions per module

## Known Limitations

- Baseline UI is functional but can be enhanced with advanced filters and batch actions
