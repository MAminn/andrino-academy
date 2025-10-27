sudo apt install -y postgresql postgresql-contrib# Enhancement: Session Track & Instructor Assignment Updates

**Date**: October 19, 2025
**Status**: ✅ Implemented
**Feature**: Allow coordinators to change session track and instructor assignments when editing

## Problem

When editing a session in the coordinator dashboard, the track selection dropdown was visible but changes weren't being saved. The API didn't support updating `trackId` or `instructorId` fields.

## Solution Implemented

### API Route: PUT /api/sessions/[id]

**File**: `src/app/api/sessions/[id]/route.ts`

Added support for updating session track and instructor assignments with proper validation and automatic instructor assignment.

### Changes Made:

#### 1. Extract trackId and instructorId from Request Body

```typescript
const {
  title,
  description,
  date,
  startTime,
  endTime,
  meetLink,
  externalLink,
  trackId, // ← Added
  instructorId, // ← Added
  materials,
  notes,
  status,
} = body;
```

#### 2. Validate Track Changes (Lines 164-186)

```typescript
// Validate trackId if changing track
if (trackId && trackId !== existingSession.trackId) {
  const newTrack = await prisma.track.findUnique({
    where: { id: trackId },
    include: { instructor: true, coordinator: true },
  });

  if (!newTrack) {
    return createErrorResponse("المسار المحدد غير موجود", 400);
  }

  // Check permission for new track
  const canAccessNewTrack =
    allowedRoles.includes(session.user.role) ||
    (session.user.role === "coordinator" &&
      newTrack.coordinatorId === session.user.id);

  if (!canAccessNewTrack) {
    return ErrorResponses.forbidden();
  }
}
```

**Logic**: Coordinators can only move sessions to tracks they coordinate. Managers and CEOs can move to any track.

#### 3. Validate Instructor Changes (Lines 188-196)

```typescript
// Validate instructorId if provided
if (instructorId && instructorId !== existingSession.instructorId) {
  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
  });

  if (!instructor || instructor.role !== "instructor") {
    return createErrorResponse("المعلم المحدد غير موجود", 400);
  }
}
```

**Logic**: Ensures the instructor exists and has the correct role.

#### 4. Update Conflict Detection (Lines 226-234)

```typescript
// Check for time conflicts if date/time/track is being updated
if (date || startTime || endTime || trackId) {
  const checkDate = date ? new Date(date) : existingSession.date;
  const checkStartTime = startTime || existingSession.startTime;
  const checkEndTime = endTime || existingSession.endTime;
  const checkTrackId = trackId || existingSession.trackId; // ← Use new track if changing

  const conflictingSessions = await prisma.liveSession.findMany({
    where: {
      id: { not: id },
      trackId: checkTrackId, // ← Check conflicts in the target track
      // ... time overlap logic
    },
  });
}
```

**Logic**: When changing tracks, check for conflicts in the NEW track, not the old one.

#### 5. Auto-Assign Instructor When Track Changes (Lines 289-303)

```typescript
// If trackId is being changed, automatically update instructorId to match the new track's instructor
if (trackId !== undefined && trackId !== existingSession.trackId) {
  const newTrack = await prisma.track.findUnique({
    where: { id: trackId },
    select: { instructorId: true },
  });
  if (newTrack) {
    updateData.trackId = trackId;
    updateData.instructorId = newTrack.instructorId; // Auto-assign track's instructor
  }
} else if (instructorId !== undefined) {
  // Only allow manual instructor change if track isn't changing
  updateData.instructorId = instructorId;
}
```

**Logic**:

- When track changes → Instructor is automatically set to the new track's instructor
- When track doesn't change → Instructor can be manually updated (for special cases)

#### 6. Update TypeScript Type Definition (Lines 268-286)

```typescript
const updateData: {
  title?: string;
  description?: string | null;
  date?: Date;
  startTime?: string;
  endTime?: string;
  trackId?: string; // ← Added
  instructorId?: string; // ← Added
  externalLink?: string | null;
  materials?: string | null;
  notes?: string | null;
  status?: SessionStatus;
} = {};
```

## Business Logic

### Track Assignment Rules:

1. **Coordinator**: Can only assign sessions to tracks they coordinate
2. **Manager/CEO**: Can assign sessions to any track
3. **Instructor**: Cannot change track assignment (future consideration)

### Instructor Assignment Rules:

1. **Automatic**: When track changes, instructor is automatically updated to match the track
2. **Manual Override**: Instructor can be manually changed if track stays the same (for guest instructors, substitutes, etc.)
3. **Validation**: System ensures instructor exists and has correct role

### Conflict Detection:

- Checks for time conflicts in the **target track** (not source track)
- Prevents double-booking within the same track
- Allows same time slot if tracks are different

## Use Cases

### Use Case 1: Move Session to Different Track

**Scenario**: Session was created in "Math Track" but should be in "Physics Track"

**Steps**:

1. Coordinator opens edit modal
2. Changes track from "Math" to "Physics"
3. System automatically assigns Physics track's instructor
4. Validates no conflicts in Physics track schedule
5. Saves successfully

**Result**: Session moved to new track with correct instructor

### Use Case 2: Change Session Instructor (Same Track)

**Scenario**: Regular instructor is sick, substitute instructor takes over

**Steps**:

1. Manager opens edit modal
2. Keeps track the same
3. Manually changes instructor to substitute
4. Saves successfully

**Result**: Session stays in same track but with different instructor

### Use Case 3: Coordinator Tries Unauthorized Track

**Scenario**: Coordinator tries to move session to track they don't coordinate

**Steps**:

1. Coordinator opens edit modal
2. Changes track to one they don't coordinate
3. Attempts to save
4. ❌ Receives 403 Forbidden error

**Result**: Permission denied, session unchanged

## UI/UX

### SessionSchedulingModal Behavior:

- Track dropdown shows all tracks coordinator can access
- When track is selected, instructor is automatically determined (no separate instructor field)
- Track information displays: "Track Name - Grade (مع Instructor Name)"
- Submit button triggers PUT request with new trackId

### Coordinator Dashboard:

- Edit button opens modal with current track pre-selected
- Track can be changed via dropdown
- Save triggers update with automatic instructor assignment

## Data Integrity

### Attendance Records:

- ⚠️ **Important**: Changing track doesn't affect existing attendance records
- Attendance records remain linked to the session
- Consider implications: students enrolled in old track may have attendance in new track's session

### Recommendation:

- Allow track changes for DRAFT or SCHEDULED sessions only
- Restrict track changes for ACTIVE or COMPLETED sessions
- Add warning message if attendance exists

## Testing

### Test Cases:

**Test 1: Change Track (Same Coordinator)**

```typescript
PUT /api/sessions/{id}
{
  "trackId": "newTrackId"
}
Expected: 200, session updated, instructor auto-assigned
```

**Test 2: Change Track (Different Coordinator)**

```typescript
PUT /api/sessions/{id}
{
  "trackId": "unauthorizedTrackId"
}
Expected: 403 Forbidden
```

**Test 3: Change Instructor (Same Track)**

```typescript
PUT /api/sessions/{id}
{
  "instructorId": "newInstructorId"
}
Expected: 200, instructor updated
```

**Test 4: Time Conflict in New Track**

```typescript
PUT /api/sessions/{id}
{
  "trackId": "newTrackId",
  "date": "2025-10-20",
  "startTime": "14:00",
  "endTime": "16:00"
}
Expected: 400, "تعارض زمني مع جلسة موجودة"
```

### Manual Testing:

1. Login as: `coordinator@andrino-academy.com` / `Coord2024!`
2. Navigate to Dashboard → "الجلسات القادمة"
3. Click "تعديل" on any session
4. Change track in dropdown
5. Click Save
6. ✅ Verify session shows new track and instructor
7. ✅ Check no errors in console

## Future Enhancements

### Potential Additions:

1. **Track Change Confirmation**: Show warning dialog when changing tracks
2. **Attendance Migration**: Option to move attendance records to new track
3. **Instructor Override**: Add optional instructor field in modal for manual override
4. **Track Change History**: Log track changes for audit purposes
5. **Bulk Track Update**: Update multiple sessions at once

### Business Rules to Consider:

- Prevent track changes after session starts (status = ACTIVE)
- Notify old track coordinator when session is moved away
- Send notification to new instructor when auto-assigned
- Update student notifications if track changes

## API Documentation

### PUT /api/sessions/{id}

**Request Body** (all fields optional):

```typescript
{
  title?: string;
  description?: string;
  date?: string;          // ISO date format
  startTime?: string;     // HH:mm format
  endTime?: string;       // HH:mm format
  trackId?: string;       // Changes track, auto-updates instructor
  instructorId?: string;  // Manual instructor change (if track not changing)
  externalLink?: string;
  materials?: string;
  notes?: string;
  status?: SessionStatus;
}
```

**Response** (200 OK):

```typescript
{
  success: true,
  data: {
    id: string,
    title: string,
    trackId: string,
    instructorId: string,
    // ... full session object with relations
  },
  message: "تم تحديث الجلسة بنجاح"
}
```

**Errors**:

- `400`: Invalid track, instructor, or time conflict
- `401`: Unauthorized
- `403`: No permission to access new track
- `404`: Session not found

---

**Enhancement completed successfully!** Coordinators can now change session track assignments with automatic instructor updates.
