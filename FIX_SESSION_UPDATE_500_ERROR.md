# Fix: 500 Error When Updating Sessions

**Date**: October 19, 2025
**Status**: ✅ Fixed
**Error**: `PUT http://localhost:3000/api/sessions/{id} 500 (Internal Server Error)`

## Root Cause Analysis

The session edit functionality was failing with a 500 error due to **two critical issues**:

### Issue 1: Status Enum Case Mismatch

- **Problem**: Modal was sending `status: "scheduled"` (lowercase)
- **Expected**: Prisma schema enum expects `"SCHEDULED"` (uppercase)
- **Impact**: Caused Prisma validation error when creating/updating sessions

### Issue 2: Field Name Mismatch

- **Problem**: PUT API endpoint was trying to update `meetLink` field
- **Schema**: Database field is actually named `externalLink`
- **Impact**: Prisma couldn't find the field, causing database update to fail

## Prisma Schema Reference

```prisma
model LiveSession {
  id           String   @id @default(cuid())
  title        String
  description  String?
  trackId      String
  instructorId String
  date         DateTime
  startTime    String
  endTime      String
  externalLink String?  // ← Correct field name
  status       SessionStatus @default(DRAFT)
  // ... other fields
}

enum SessionStatus {
  DRAFT      // ← Uppercase enum values
  SCHEDULED
  READY
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}
```

## Files Modified

### 1. SessionSchedulingModal.tsx

**Location**: `src/app/components/coordinator/SessionSchedulingModal.tsx`

**Change 1**: Fixed status enum case

```tsx
// BEFORE:
body: JSON.stringify({
  ...formData,
  status: "scheduled", // ❌ Lowercase
}),

// AFTER:
body: JSON.stringify({
  ...formData,
  status: "SCHEDULED", // ✅ Uppercase to match enum
}),
```

**Change 2**: Only set status for new sessions, not edits

```tsx
// Prepare the request body
const requestBody = editSession
  ? formData // When editing, send only the form data (don't override status)
  : {
      ...formData,
      status: "SCHEDULED", // Default status only for new sessions
    };

const response = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(requestBody),
});
```

**Rationale**: When editing an existing session, we should preserve its current status (ACTIVE, COMPLETED, etc.) rather than forcing it back to SCHEDULED.

### 2. API Route: /api/sessions/[id]/route.ts

**Location**: `src/app/api/sessions/[id]/route.ts`

**Change 1**: Accept both field names for compatibility (Lines ~115-127)

```tsx
const body = await request.json();
const {
  title,
  description,
  date,
  startTime,
  endTime,
  meetLink, // ← Legacy field name
  externalLink, // ← Current field name
  materials,
  notes,
  status,
} = body;

// Support both meetLink and externalLink for compatibility
const linkToUpdate = externalLink || meetLink;
```

**Change 2**: Update type definition and use correct field (Lines ~233-256)

```tsx
// BEFORE:
const updateData: {
  // ...
  meetLink?: string | null; // ❌ Wrong field name
} = {};

if (meetLink !== undefined) updateData.meetLink = meetLink;

// AFTER:
const updateData: {
  // ...
  externalLink?: string | null; // ✅ Correct field name
} = {};

if (linkToUpdate !== undefined) updateData.externalLink = linkToUpdate;
```

## Why This Works

1. **Enum Case**: Prisma strictly validates enum values. `"scheduled"` ≠ `SCHEDULED`
2. **Field Mapping**: The POST route already correctly mapped `meetLink` → `externalLink`, but PUT route was missing this
3. **Status Preservation**: When editing, we now preserve the session's current status instead of resetting it

## Testing the Fix

1. **Start the server**:

   ```bash
   npm run dev
   ```

2. **Login as Coordinator**:

   - Email: `coordinator@andrino-academy.com`
   - Password: `Coord2024!`

3. **Test Edit Functionality**:

   - Navigate to Dashboard → "الجلسات القادمة" (Upcoming Sessions)
   - Click "تعديل" (Edit) on any session
   - Modify the title, description, date, or times
   - Click Save
   - ✅ Should see success message
   - ✅ Session should update in database
   - ✅ Dashboard should refresh with new data

4. **Test Schedule Functionality**:

   - Click "جدولة" (Schedule) on any session
   - Modify the date or times
   - Click Save
   - ✅ Should see success message
   - ✅ Times should update correctly

5. **Check Console**:
   - ✅ No 500 errors
   - ✅ PUT request returns 200
   - ✅ Success response from API

## Expected Behavior Now

### Creating New Session

```json
POST /api/sessions
{
  "title": "Math Session",
  "trackId": "...",
  "date": "2025-10-20",
  "startTime": "14:00",
  "endTime": "16:00",
  "status": "SCHEDULED"  // ← Set for new sessions
}
```

**Response**: 200, session created with SCHEDULED status

### Editing Existing Session

```json
PUT /api/sessions/{id}
{
  "title": "Updated Math Session",
  "date": "2025-10-21",
  "startTime": "15:00",
  "endTime": "17:00"
  // status is NOT included - preserves existing status
}
```

**Response**: 200, session updated, status unchanged

## Compatibility Notes

The API now accepts both `meetLink` and `externalLink` field names:

- **Frontend can send**: `meetLink` or `externalLink`
- **Database stores**: `externalLink`
- **API handles**: Backward compatibility via `linkToUpdate = externalLink || meetLink`

This ensures existing code using `meetLink` continues to work while new code can use the correct `externalLink` field name.

## Verification

✅ No TypeScript errors
✅ No lint warnings
✅ Server compiles successfully
✅ Prisma field names match schema
✅ Enum values match schema
✅ Backward compatibility maintained
✅ Status preservation logic implemented

---

**Fix completed successfully!** Session editing now works without 500 errors.
