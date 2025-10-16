# Bug Fixes Applied - Testing Guide

## 🔧 Issues Fixed

### 1. ✅ Instructor Dashboard - Tracks Not Showing

**Problem**: Instructors couldn't see assigned tracks in their dashboard

**Root Cause**: Track store expected `{tracks: [...]}` but API returns `{success: true, data: [...]}`

**Fix Applied**:

- Updated `useTrackStore.ts` to handle both response formats
- Added console logging for debugging

**Testing**:

```bash
1. Login as instructor (ahmed.instructor@andrino-academy.com / Instructor123!)
2. Check browser console for "Tracks API Response:" logs
3. Dashboard should show assigned tracks
```

---

### 2. ✅ Student Dashboard - TypeError on Instructor Name

**Problem**: `Cannot read properties of undefined (reading 'name')` at `session.track.instructor.name`

**Root Causes**:

1. Sessions API didn't include `track.instructor` (only direct `instructor`)
2. Student dashboard didn't handle optional chaining for instructor data

**Fixes Applied**:

- Updated `/api/sessions` to include `track.instructor` data
- Added optional chaining (`?.`) in student dashboard for:
  - `session.track?.instructor?.name`
  - `session.track?.grade?.name`
  - `track.instructor?.name` in tracks list

**Testing**:

```bash
1. Login as student (ali.student@andrino-academy.com / Student123!)
2. Check "Available Tracks" section - should show instructor names
3. Check "Upcoming Sessions" - should show instructor names
4. No errors in console
```

---

## 🧪 Complete Testing Checklist

### **Test 1: Manager Assigns Instructor to Track**

**Steps**:

1. Login as Manager (`manager@andrino-academy.com` / `Manager2024!`)
2. Go to `/manager/grades`
3. Click "تعديل" (Edit) on any grade
4. Navigate to "Tracks Management" tab
5. Select a track from dropdown
6. Select an instructor from dropdown
7. Click "Save Changes"

**Expected Results**:

- ✅ Success message appears
- ✅ Track shows updated instructor
- ✅ No console errors

---

### **Test 2: Instructor Sees Assigned Tracks**

**Steps**:

1. Logout from manager
2. Login as Instructor (`ahmed.instructor@andrino-academy.com` / `Instructor123!`)
3. Go to `/instructor/dashboard`
4. Check "المسارات التعليمية" section (bottom of page)

**Expected Results**:

- ✅ Console shows: "Tracks API Response: {success: true, data: [...]}"
- ✅ Console shows: "Parsed tracks: [array of tracks]"
- ✅ Tracks assigned to this instructor are visible
- ✅ Each track shows grade name, sessions count
- ✅ If no tracks assigned, shows "لم يتم تعيين أي مسارات لك بعد"

**If tracks still don't show**:

1. Check console logs - what does API return?
2. Verify database has correct `instructorId`:
   ```sql
   SELECT id, name, instructorId FROM Track WHERE instructorId = 'ahmed-instructor-id';
   ```
3. Check that `/api/tracks` actually filters by instructorId

---

### **Test 3: Student Sees Tracks with Instructors**

**Steps**:

1. Ensure student is assigned to a grade (use Manager dashboard)
2. Ensure that grade has tracks (use Manager dashboard)
3. Login as Student (`ali.student@andrino-academy.com` / `Student123!`)
4. Go to `/student/dashboard`
5. Check "المسارات المتاحة" section

**Expected Results**:

- ✅ Tracks are visible
- ✅ Each track shows instructor name (or "غير محدد" if no instructor)
- ✅ No "Cannot read properties of undefined" errors
- ✅ Session count shows for each track

---

### **Test 4: Student Sees Upcoming Sessions**

**Steps**:

1. As Instructor, create a session in one of your tracks
2. Add external link to session (make it READY or ACTIVE)
3. Login as Student (assigned to same grade as the track)
4. Go to `/student/dashboard`
5. Check "الجلسات القادمة" section

**Expected Results**:

- ✅ Session appears in list
- ✅ Shows track name
- ✅ Shows instructor name (or "غير محدد")
- ✅ Shows grade name (or "غير محدد")
- ✅ No console errors

---

## 🐛 If Issues Persist

### **Instructor Still Can't See Tracks**

**Debug Steps**:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to instructor dashboard
4. Look for `/api/tracks` request
5. Check the Response:

**Good Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "track-id",
      "name": "Track Name",
      "instructorId": "instructor-id",
      "grade": {...},
      "instructor": {...}
    }
  ]
}
```

**Bad Response** (empty):

```json
{
  "success": true,
  "data": []
}
```

**If Empty**:

- Problem: No tracks assigned to this instructor in database
- Solution: Use Manager dashboard to assign tracks

**If Error Response**:

- Check server console for errors
- Verify authentication is working
- Check if instructor ID matches

---

### **Student Still Sees Errors**

**Debug Steps**:

1. Check browser console for exact error
2. If "Cannot read properties of undefined":
   - Note which property is undefined
   - Check Network tab → `/api/sessions` response
   - Verify response includes:
     ```json
     {
       "sessions": [{
         "track": {
           "name": "...",
           "grade": {...},
           "instructor": {...}  // ← Must be present
         }
       }]
     }
     ```

**If instructor is missing in track**:

- Problem: Database track has no instructor assigned
- Solution: Manager must assign instructor to track

---

## 📊 Data Verification Queries

### **Check Track Assignments**:

```sql
-- See all tracks with instructors
SELECT
  t.id,
  t.name AS track_name,
  t.instructorId,
  u.name AS instructor_name,
  g.name AS grade_name
FROM Track t
LEFT JOIN User u ON t.instructorId = u.id
LEFT JOIN Grade g ON t.gradeId = g.id;
```

### **Check Student Grade Assignment**:

```sql
-- See which students are in which grades
SELECT
  u.name AS student_name,
  u.email,
  g.name AS grade_name
FROM User u
LEFT JOIN Grade g ON u.gradeId = g.id
WHERE u.role = 'student';
```

### **Check Sessions with Full Data**:

```sql
-- See sessions with track and instructor info
SELECT
  ls.id,
  ls.title,
  ls.date,
  t.name AS track_name,
  u.name AS instructor_name,
  g.name AS grade_name
FROM LiveSession ls
JOIN Track t ON ls.trackId = t.id
JOIN User u ON t.instructorId = u.id
JOIN Grade g ON t.gradeId = g.id;
```

---

## 🔄 Re-seed Database (If Needed)

If data is corrupted or inconsistent:

```bash
# Backup current data (optional)
cp prisma/dev.db prisma/dev.db.backup

# Re-seed with fresh data
npx prisma db push --force-reset
npx prisma db seed
```

**Warning**: This deletes all data and recreates it!

---

## 📝 Summary of Changes

| File                                 | Change                              | Purpose                                      |
| ------------------------------------ | ----------------------------------- | -------------------------------------------- |
| `src/stores/useTrackStore.ts`        | Handle both API response formats    | Fix instructor tracks not loading            |
| `src/app/api/sessions/route.ts`      | Include `track.instructor` in query | Provide instructor data to students          |
| `src/app/student/dashboard/page.tsx` | Add optional chaining `?.`          | Prevent crashes when instructor is undefined |

---

## ✅ Success Criteria

**All tests pass when**:

1. ✅ Manager can assign instructors to tracks
2. ✅ Instructor sees only their assigned tracks
3. ✅ Student sees tracks with instructor names
4. ✅ Student sees sessions with instructor names
5. ✅ No console errors
6. ✅ No TypeScript errors

---

## 🆘 Still Not Working?

If issues persist after these fixes:

1. **Clear browser cache** and restart dev server
2. **Check database** - verify data exists and is correct
3. **Restart dev server**: `npm run dev`
4. **Share error details**:
   - Browser console errors (screenshot)
   - Network tab response (screenshot)
   - Server console output

The fixes are in place - now test them! 🚀
