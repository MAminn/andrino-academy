# 🧪 Andrino Academy - Comprehensive Testing Plan

**Date**: November 18, 2025  
**Scope**: Test all new features from restructure implementation  
**Duration**: 2-3 hours

---

## 📋 Pre-Testing Setup

### 1. Database State
```bash
# Reset and seed database for clean testing
npx prisma db push --force-reset
npx prisma db seed
```

### 2. Test User Accounts
After seeding, you should have these users:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Manager | manager@andrino.com | password123 | Full system control |
| Instructor | instructor@andrino.com | password123 | Availability & content |
| Student | student@andrino.com | password123 | Booking & learning |
| Coordinator | coordinator@andrino.com | password123 | Track oversight |

### 3. Start Development Server
```bash
npm run dev
```

Open: http://localhost:3000

---

## 🎯 Test Scenario 1: Manager - Schedule Settings

**Login**: manager@andrino.com / password123

### Steps:
1. ✅ Navigate to **Manager Dashboard**
2. ✅ Go to **Settings** → **Schedule Settings** (or `/manager/settings/schedule`)
3. ✅ Verify current settings are displayed:
   - Week reset day (should show current value like "السبت")
   - Week reset hour (should show hour like "00:00")
   - Availability open hours (should show number like 168)
4. ✅ Test changing settings:
   - Change week reset day to **Sunday (الأحد)**
   - Change week reset hour to **22:00**
   - Change availability open hours to **120** (5 days)
5. ✅ Click **Save** button
6. ✅ Verify success message appears
7. ✅ Verify "Next Reset Time" preview updates
8. ✅ Refresh page and confirm settings persisted

**Expected Results**:
- Settings save successfully
- Next reset preview shows correct calculation
- Settings persist after refresh

---

## 🎯 Test Scenario 2: Manager - Multi-Content Upload

**Login**: manager@andrino.com / password123

### Part A: Upload Instructor-Targeted Content

1. ✅ Navigate to **Content Management** (or `/manager/content`)
2. ✅ Click **Upload New Content** button
3. ✅ Select a track (e.g., "JavaScript Basics - Grade 1")
4. ✅ On **Instructor Content** tab:
   - Add Content Item #1:
     - Title: "Course Introduction Video"
     - Type: VIDEO
     - Category: LECTURE
     - Upload: Any MP4 video file (< 500MB)
   - Click **+ Add Another Content Item**
   - Add Content Item #2:
     - Title: "Course Syllabus PDF"
     - Type: PDF
     - Category: REFERENCE
     - Upload: Any PDF file (< 50MB)
5. ✅ Click **Upload** button
6. ✅ Verify success message
7. ✅ Verify both files appear in the content list

### Part B: Upload Student-Targeted Content with Tasks & Assignments

1. ✅ Click **Upload New Content** again
2. ✅ Select same track
3. ✅ Switch to **Student Content** tab
4. ✅ Add Content Item:
   - Title: "Lesson 1: Variables"
   - Type: VIDEO
   - Category: LECTURE
   - Upload: Any video file
5. ✅ Scroll to **Tasks** section:
   - Add Task #1:
     - Title: "Practice Exercise 1"
     - Description: "Complete the variables practice exercises in your notebook"
   - Click **+ Add Task**
   - Add Task #2:
     - Title: "Read Chapter 2"
     - Description: "Read chapter 2 from the textbook"
6. ✅ Scroll to **Assignments** section:
   - Add Assignment #1:
     - Title: "Variables Homework"
     - Description: "Submit your completed homework"
     - Due Date: Set to 7 days from today
     - Max Grade: 100
     - Upload: Any PDF file
7. ✅ Click **Upload**
8. ✅ Verify success and content appears

**Expected Results**:
- All files upload successfully
- Content items saved with correct types
- Tasks appear in student view
- Assignments appear with submission option

---

## 🎯 Test Scenario 3: Instructor - Set Weekly Availability

**Login**: instructor@andrino.com / password123

### Steps:

1. ✅ Navigate to **Instructor Dashboard**
2. ✅ Go to **Manage Availability** (or `/instructor/availability`)
3. ✅ Read the instructions card
4. ✅ Select a **Track** from dropdown (e.g., "JavaScript Basics")
5. ✅ Verify calendar shows current week (Sunday-Saturday, 13:00-22:00)
6. ✅ Test selecting availability:
   - **Click** on Sunday 14:00-15:00 (should turn blue)
   - **Click and drag** across Monday 16:00-18:00 (should select multiple slots, all turn blue)
   - **Click again** on Sunday 14:00 (should deselect, turn white)
   - Select at least **5-6 time slots** across different days
7. ✅ Click **Save Availability** button
8. ✅ Verify success message
9. ✅ Verify selected slots turn **green** (confirmed)
10. ✅ Test **Confirm for Week** button:
    - Click **Confirm for Week**
    - Confirm in dialog
    - Verify all green slots become **locked** (cannot be changed)
11. ✅ Try clicking a confirmed slot (should not change)
12. ✅ Navigate to next week using **Next Week** button
13. ✅ Verify it's a fresh calendar (no selections)
14. ✅ Go back to current week
15. ✅ Verify confirmed slots still show green

**Expected Results**:
- Calendar is interactive
- Click/drag selection works
- Save persists selections
- Confirm locks availability
- Week navigation works

---

## 🎯 Test Scenario 4: Student - Browse & Book Sessions

**Login**: student@andrino.com / password123

### Part A: Browse Available Sessions

1. ✅ Navigate to **Student Dashboard**
2. ✅ Go to **Book Sessions** (or `/student/sessions`)
3. ✅ On **Available Sessions** tab:
   - Select track: "JavaScript Basics"
   - Verify week selector appears
   - Verify sessions grouped by instructor name
4. ✅ Check availability display:
   - Should see instructor name
   - Should see green time slots (from Test Scenario 3)
   - Should see day, date, time range for each slot

### Part B: Book a Session

1. ✅ Find an available slot (green)
2. ✅ Click **Book** button
3. ✅ In the booking modal:
   - Verify instructor name, track, date, time shown
   - Add student notes: "I need help with variable scope"
   - Click **Confirm Booking**
4. ✅ Verify success message
5. ✅ Verify slot disappears from available sessions (no longer bookable)

### Part C: View My Bookings

1. ✅ Switch to **My Bookings** tab
2. ✅ Verify your booking appears with:
   - Instructor name and email
   - Track name
   - Date and time
   - Your student notes (editable)
   - Status badge: "محجوز" (yellow)
3. ✅ Test editing notes:
   - Click edit icon on student notes
   - Change to: "Also need help with data types"
   - Click **Save**
   - Verify success message
4. ✅ Test cancellation:
   - Find a booking
   - Click **Cancel Booking** button
   - Confirm cancellation
   - Verify booking removed
   - Go back to Available Sessions - slot should reappear

**Expected Results**:
- Available slots display correctly
- Booking modal works
- Booking creates successfully
- Notes are editable
- Cancellation works and frees up slot

---

## 🎯 Test Scenario 5: Instructor - View Bookings & Add Notes

**Login**: instructor@andrino.com / password123

### Steps:

1. ✅ Navigate to **Instructor Dashboard**
2. ✅ Go to **My Bookings** or **View Bookings** (or `/instructor/bookings`)
3. ✅ Verify bookings list shows:
   - Student who booked (from Test Scenario 4)
   - Week selector dropdown
   - Bookings grouped by day
   - Session status badges
4. ✅ Find the student booking
5. ✅ Verify you can see:
   - Student name and email
   - Student notes (read-only, blue background): "Also need help with data types"
   - Track name
   - Date and time
   - Status: "محجوز"
6. ✅ Add instructor notes:
   - Click edit icon on instructor notes section
   - Type: "Prepared extra examples on variable scope"
   - Click **Save**
   - Verify success message
7. ✅ Test week filter:
   - Change week dropdown to next week
   - Verify bookings list updates (should be empty)
   - Go back to current week
   - Verify your booking reappears

**Expected Results**:
- All bookings visible
- Student notes displayed (read-only for instructor)
- Instructor can add/edit their own notes
- Week filtering works

---

## 🎯 Test Scenario 6: Instructor - Create Session & Link Bookings

**Login**: instructor@andrino.com / password123

### Steps:

1. ✅ Navigate to **Instructor Dashboard**
2. ✅ Click **Create New Session** or find session creation modal
3. ✅ Fill in session details:
   - Title: "JavaScript Variables - Live Class"
   - Description: "Interactive session on variables and data types"
   - Date: Select date of one of your booked slots (from Test Scenario 4)
   - Start Time: Match the booking time (e.g., 16:00)
   - End Time: 1 hour later (e.g., 17:00)
   - Track: JavaScript Basics
   - Instructor: Select yourself
4. ✅ Verify "Available Bookings" section appears automatically
5. ✅ Should see:
   - Student booking(s) for that exact time slot
   - Student name and email
   - Student notes preview
   - Checkbox selection
6. ✅ Click on student booking card to select it (should turn blue with checkmark)
7. ✅ Add external link (optional): "https://meet.google.com/abc-defg-hij"
8. ✅ Click **Create Session**
9. ✅ Verify success message
10. ✅ Go to **My Bookings** page
11. ✅ Find the linked booking
12. ✅ Verify status changed to **"مجدولة"** or **"confirmed"** (blue badge)
13. ✅ Verify **"Join Session"** button appears with the Google Meet link

**Expected Results**:
- Session creation shows matching bookings
- Bookings can be selected
- Session creates with linked bookings
- Booking status updates to confirmed
- External link appears in booking view

---

## 🎯 Test Scenario 7: Student - Join Session & View Content

**Login**: student@andrino.com / password123

### Part A: Join Linked Session

1. ✅ Go to **Book Sessions** → **My Bookings** tab
2. ✅ Find booking linked in Test Scenario 6
3. ✅ Verify:
   - Status badge shows "مجدولة" (blue)
   - **"Join Session"** button visible
   - Session title shown: "JavaScript Variables - Live Class"
   - Instructor notes visible: "Prepared extra examples on variable scope"
4. ✅ Click **"Join Session"** button
5. ✅ Verify it opens the external link (Google Meet) in new tab

### Part B: View Module Content

1. ✅ Navigate to **My Tracks** or track content page
2. ✅ Select **JavaScript Basics** track
3. ✅ Find module with student-targeted content (from Test Scenario 2)
4. ✅ Click to view module
5. ✅ Verify **Student Content** tab shows:
   - Video: "Lesson 1: Variables" with play/download button
   - PDF/Documents if uploaded
   - **Tasks** section with 2 tasks:
     - "Practice Exercise 1"
     - "Read Chapter 2"
   - **Assignments** section with 1 assignment:
     - "Variables Homework"
     - Due date shown
     - Status: "لم يتم التسليم" (not submitted - gray badge)

### Part C: Submit Assignment

1. ✅ In **Assignments** section, find "Variables Homework"
2. ✅ Click **Submit** or expand assignment
3. ✅ Verify shows:
   - Assignment title and description
   - Due date
   - Max grade: 100
   - File upload area
4. ✅ Upload a file (any PDF/DOC < 20MB)
5. ✅ Click **Submit Assignment**
6. ✅ Verify success message
7. ✅ Verify status changes to **"تم التسليم"** (submitted - yellow badge)
8. ✅ Verify upload button disabled/changed to "Submitted"
9. ✅ Refresh page - verify submission persists

**Expected Results**:
- Session link works
- Module content displays correctly
- Tasks visible
- Assignment shows details
- File upload works
- Submission status updates

---

## 🎯 Test Scenario 8: Instructor - View Teaching Materials

**Login**: instructor@andrino.com / password123

### Steps:

1. ✅ Navigate to **Instructor Dashboard**
2. ✅ Go to **Teaching Materials** (or `/instructor/materials`)
3. ✅ Read instructions card
4. ✅ Verify track filter dropdown exists
5. ✅ Select **"JavaScript Basics"** track
6. ✅ Verify only instructor-targeted content appears:
   - "Course Introduction Video" (from Test Scenario 2)
   - "Course Syllabus PDF" (from Test Scenario 2)
7. ✅ Verify student-targeted content does NOT appear:
   - "Lesson 1: Variables" should NOT be here
8. ✅ Test content actions:
   - Click **View** on video (should open in new tab)
   - Click **Download** on PDF (should download)
9. ✅ Verify stats summary shows:
   - Total modules count
   - Total files count
   - Videos count
   - PDFs count
10. ✅ Select **"All Tracks"** filter
11. ✅ Verify all instructor-targeted content from all tracks appears

**Expected Results**:
- Only instructor content visible
- Track filtering works
- View/Download actions work
- Statistics accurate
- Student content completely separated

---

## 🎯 Test Scenario 9: Instructor - Grade Assignment

**Login**: instructor@andrino.com / password123

### Steps:

1. ✅ Navigate to assignment grading interface (may be in Instructor Dashboard or Assignments section)
2. ✅ Find the submitted assignment from Test Scenario 7
3. ✅ Verify submission shows:
   - Student name
   - Assignment title: "Variables Homework"
   - Submission date/time
   - Submitted file with download link
   - Current status: "تم التسليم" (submitted)
4. ✅ Download and view submitted file
5. ✅ Enter grade:
   - Grade: **85** (out of 100)
   - Feedback: "Good work! Pay attention to variable naming conventions"
6. ✅ Click **Submit Grade**
7. ✅ Verify success message
8. ✅ Verify status changes to **"تم التقييم"** (graded)

**Expected Results**:
- Submission visible to instructor
- File downloadable
- Grade submission works
- Status updates

---

## 🎯 Test Scenario 10: Student - View Grade & Feedback

**Login**: student@andrino.com / password123

### Steps:

1. ✅ Navigate to module with assignment (same as Test Scenario 7)
2. ✅ Go to **Assignments** section
3. ✅ Find "Variables Homework" assignment
4. ✅ Verify displays:
   - Status badge: **"تم التقييم"** (graded - green badge)
   - Your grade: **85/100**
   - Instructor feedback: "Good work! Pay attention to variable naming conventions"
   - Submission date
   - Your submitted file name
5. ✅ Verify **cannot resubmit** (button disabled or hidden)

**Expected Results**:
- Grade visible
- Feedback shown
- Status updated
- Resubmission prevented

---

## 🎯 Test Scenario 11: Edge Cases & Error Handling

### A. Double Booking Prevention

**Login**: student@andrino.com

1. ✅ Try to book the same slot twice:
   - Book a slot
   - Try to book it again (should fail or not be visible)
2. ✅ Try booking overlapping slots:
   - Book Monday 16:00-17:00
   - Try to book Monday 16:30-17:30 (should fail if same instructor)

**Expected**: Error message or slot unavailable

### B. File Size Validation

**Login**: manager@andrino.com

1. ✅ Try uploading oversized files:
   - Video > 500MB (should reject)
   - PDF > 50MB (should reject)
   - Image > 10MB (should reject)

**Expected**: Error message about file size

### C. Unauthorized Access

**Login**: student@andrino.com

1. ✅ Try accessing manager routes:
   - Navigate to `/manager/settings/schedule`
   - Navigate to `/manager/content`

**Expected**: Redirect to unauthorized page or dashboard

### D. Form Validation

**Login**: instructor@andrino.com

1. ✅ Try creating session without required fields:
   - Leave title empty
   - Leave date empty
   - Try to submit

**Expected**: Validation errors shown

---

## 🎯 Test Scenario 12: Week Rollover & Reset

### Steps:

1. ✅ **Login**: manager@andrino.com
2. ✅ Note current schedule settings (week reset day/hour)
3. ✅ **Login**: instructor@andrino.com
4. ✅ Set availability for current week + confirm
5. ✅ **Manually advance system time** OR wait for actual week rollover
6. ✅ Verify:
   - Old availability cleared/archived
   - New week availability starts fresh
   - Availability window opens based on settings

**Expected**: System respects schedule settings for resets

*(Note: This requires time manipulation or actual waiting - may skip in quick testing)*

---

## ✅ Final Verification Checklist

After all scenarios, verify:

- [ ] No JavaScript errors in browser console (F12)
- [ ] No TypeScript compilation errors (`npx tsc --noEmit`)
- [ ] All pages load without 500 errors
- [ ] All role-based redirects work correctly
- [ ] Database has all expected records (check with Prisma Studio: `npx prisma studio`)
- [ ] File uploads stored in `/public/uploads/` directory
- [ ] All API endpoints return proper status codes
- [ ] Arabic RTL layout displays correctly
- [ ] Mobile responsive (test on narrow viewport)
- [ ] Success/error messages appear and are readable

---

## 📊 Testing Summary Template

After completing all tests, fill this out:

```markdown
## Test Results Summary

**Date Tested**: ___________
**Tester**: ___________
**Environment**: Development / Staging / Production

### Passed Tests: ____ / 50+

### Failed Tests:
1. [Scenario X] - [Issue description]
2. [Scenario Y] - [Issue description]

### Critical Issues Found:
- None / [List issues]

### Non-Critical Issues:
- None / [List issues]

### Browser Tested:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Overall Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
```

---

## 🔧 Troubleshooting Common Issues

### Database Issues
```bash
# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

### File Upload Issues
- Check `/public/uploads/` directory exists and is writable
- Check file size limits in upload handlers

### Session/Auth Issues
- Clear browser cookies
- Restart dev server
- Check `.env` has `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### TypeScript Errors
```bash
npx tsc --noEmit
# Fix any errors shown
```

---

**Good luck with testing! 🚀**
