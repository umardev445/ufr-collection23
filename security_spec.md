# Security Specification - UFR Collection

## Data Invariants
1. A review must be linked to a valid product ID.
2. A user can only submit a review with their own UID.
3. Only admins can approve, reject, or delete reviews.
4. Total rating must be between 1 and 5.
5. All critical fields (rating, comment, productId) must be present on creation.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Submit a review with another user's UID.
2. **Elevated Privilege**: Submit a review with `status: 'approved'` directly (if default is pending).
3. **Ghost Fields**: Add an extra field `isVerified: true` to a review.
4. **ID Poisoning**: Inject a 2MB string as a review ID.
5. **Denial of Wallet**: Submit thousands of empty reviews.
6. **Relational Sync Break**: Delete a product but keep its reviews.
7. **Admin Lockout**: Create a rule that denies admins access to certain reviews.
8. **PII Leak**: Read all order details (including addresses) without being an admin or the owner.
9. **Mutation Gap**: Update another user's comment.
10. **Schema Bypass**: Submit a rating of 10.
11. **Orphaned Record**: Create an order without items.
12. **Status Shortcutting**: Move an order status from 'Order Received' directly to 'Delivered' via client SDK.

## Protection Plan
- Use `isValidId()` for all path variables.
- Use `isValidReview()` schema validator.
- Use `affectedKeys().hasOnly()` for all updates.
- Strictly enforce `isAdmin()` via document lookup.
- Isolate users' private data.
