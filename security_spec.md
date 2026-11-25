# CampusBite Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Profile Ownership & PII Isolation**: A `users/{userId}` document can only be created, read, or updated by the verified user whose `request.auth.uid == userId` (or an admin). No blanket reads or non-owner queries are allowed.
2. **Order Identity & Initial State**: An `orders/{orderId}` document can only be created by a verified user with `userId == request.auth.uid`, `status == 'pending'`, and `createdAt == request.time`.
3. **Terminal State Locking**: Once an order reaches `delivered` or `cancelled`, non-admin users cannot modify any field on it.
4. **Feedback Relational Integrity**: A `feedback/{orderId}` document can only be created if `/orders/{orderId}` exists, belongs to `request.auth.uid`, and is not cancelled.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Identity Spoofing (Order)**: Create `/orders/ord1` with `userId: "other_uid"` -> `PERMISSION_DENIED`.
2. **State Shortcutting (Order)**: Create `/orders/ord2` with `status: "delivered"` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection (Profile)**: Create `/users/uid1` with extra ghost field `isAdmin: true` -> `PERMISSION_DENIED`.
4. **Email Spoofing (Admin)**: Access `/orders` with `email: "riyaagarwal1302@gmail.com"` and `email_verified: false` -> `PERMISSION_DENIED`.
5. **PII Blanket Read**: List `/users` or get `/users/other_uid` as non-admin user -> `PERMISSION_DENIED`.
6. **Query Trust Bypass**: List `/orders` without filtering `userId == request.auth.uid` as regular user -> `PERMISSION_DENIED`.
7. **ID Poisoning**: Create `/orders/<1500-char-invalid-id>` -> `PERMISSION_DENIED`.
8. **Value Poisoning**: Update `/orders/ord1` with `phone: 12345` (number) or 1MB `notes` string -> `PERMISSION_DENIED`.
9. **Terminal State Mutate**: Update `/orders/ord1` where `existing.status == 'delivered'` to `status: 'pending'` as owner -> `PERMISSION_DENIED`.
10. **Immortal Field Tampering**: Update `/orders/ord1` changing `createdAt` or `userId` -> `PERMISSION_DENIED`.
11. **Timestamp Forgery**: Create `/orders/ord3` with client-forged `createdAt` not equal to `request.time` -> `PERMISSION_DENIED`.
12. **Orphaned Feedback**: Create `/feedback/nonexistent_order` where `/orders/nonexistent_order` does not exist or belongs to someone else -> `PERMISSION_DENIED`.
