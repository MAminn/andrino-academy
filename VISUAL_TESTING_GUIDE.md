# 🎨 VISUAL TESTING GUIDE - What to Look For

This guide shows you **exactly what to expect** during manual testing.

---

## 🔐 TEST 1: LOGIN SCREEN

### What You Should See:

```
╔════════════════════════════════════╗
║                                    ║
║     [Logo/Icon]                   ║
║                                    ║
║   تسجيل الدخول إلى أندرينو أكاديمي   ║
║                                    ║
║  [البريد الإلكتروني      ]  ←     ║
║                                    ║
║  [كلمة المرور            ]  ←     ║
║                                    ║
║         [تسجيل الدخول]            ║
║                                    ║
╚════════════════════════════════════╝
```

**Check**:

- ✅ Text reads RIGHT-to-LEFT (Arabic)
- ✅ Input fields have placeholder text in Arabic
- ✅ Icons appear on LEFT side (RTL)
- ✅ Submit button says "تسجيل الدخول"

**When you click submit with empty fields**:

```
❌ البريد الإلكتروني مطلوب
❌ كلمة المرور مطلوبة
```

(Red error messages in Arabic)

**After successful login**:

```
URL changes to: /manager/dashboard
(or /student/dashboard, /instructor/dashboard, etc.)
```

---

## 👨‍🏫 TEST 2: INSTRUCTOR DASHBOARD

### What You Should See:

```
╔═══════════════════════════════════════════════════════════╗
║  [Logout] ← مرحباً Ahmed Instructor                       ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  📊 لوحة تحكم المعلم                                      ║
║                                                            ║
║  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         ║
║  │   4    │  │   12   │  │   8    │  │  95%   │         ║
║  │ المسارات│  │ الجلسات│  │ النشطة │  │ الحضور │         ║
║  └────────┘  └────────┘  └────────┘  └────────┘         ║
║                                                            ║
║  المسارات المخصصة                                         ║
║  ┌─────────────────────────────────────────────┐         ║
║  │ Mathematics Track                    [عرض]  │         ║
║  │ Grade: المستوى الأول │ Sessions: 4         │         ║
║  └─────────────────────────────────────────────┘         ║
║                                                            ║
║  الجلسات القادمة                                          ║
║  ┌─────────────────────────────────────────────┐         ║
║  │ 📚 Math Session 1                           │         ║
║  │ 📅 2024-01-15 │ ⏰ 10:00 AM                 │         ║
║  │ [مسودة] لم يتم إضافة رابط خارجي     [إضافة رابط] │ ← AMBER badge
║  └─────────────────────────────────────────────┘         ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

**Check**:

- ✅ Stat cards show numbers
- ✅ Track cards list your assigned tracks
- ✅ Session cards show upcoming sessions
- ✅ Sessions WITHOUT external link show amber/red badge
- ✅ "إضافة رابط" (Add Link) button visible

---

## 🔗 TEST 3: EXTERNAL LINK MODAL

### Click "إضافة رابط" → Modal Opens:

```
╔═══════════════════════════════════════════════╗
║  إضافة رابط خارجي للجلسة                 [X] ║
╠═══════════════════════════════════════════════╣
║                                                ║
║  Math Session 1                               ║
║                                                ║
║  رابط الجلسة الخارجي                          ║
║  ┌──────────────────────────────────────┐     ║
║  │ https://zoom.us/j/1234567890         │     ║
║  └──────────────────────────────────────┘     ║
║                                                ║
║  ✅ رابط صحيح - Zoom                          ║ ← Green message
║                                                ║
║  💡 يمكنك استخدام:                            ║
║     • Zoom: zoom.us/j/...                     ║
║     • Google Meet: meet.google.com/...        ║
║     • Microsoft Teams: teams.microsoft.com/...║
║                                                ║
║            [إلغاء]    [حفظ]                   ║
╚═══════════════════════════════════════════════╝
```

**Test Invalid Links** - Should show RED error:

| Link                   | Expected Result              |
| ---------------------- | ---------------------------- |
| `not-a-url`            | ❌ "رابط غير صحيح" (red)     |
| `http://zoom.us/j/123` | ❌ "يجب استخدام HTTPS" (red) |
| `zoom.us/123`          | ❌ "رابط غير صحيح" (red)     |
| _(empty)_              | ❌ "الرابط مطلوب" (red)      |

**Test Valid Links** - Should show GREEN checkmark:

| Link                                             | Expected Result                      |
| ------------------------------------------------ | ------------------------------------ |
| `https://zoom.us/j/1234567890`                   | ✅ "رابط صحيح - Zoom" (green)        |
| `https://meet.google.com/abc-def-ghi`            | ✅ "رابط صحيح - Google Meet" (green) |
| `https://teams.microsoft.com/l/meetup-join/test` | ✅ "رابط صحيح - Teams" (green)       |

**After clicking "حفظ" (Save)**:

```
✅ Success toast: "تم حفظ الرابط بنجاح"
Modal closes
Session card updates
```

---

## 🚀 TEST 4: SESSION STATUS CHANGES

### After Adding Link - Badge Changes:

**BEFORE** (no link):

```
║  [مسودة] لم يتم إضافة رابط خارجي     [إضافة رابط]  ║
   ↑ Amber/Red badge                    ↑ Add Link button
```

**AFTER** (link added):

```
║  [جاهزة] رابط متوفر ✓                [بدء الجلسة]  ║
   ↑ Green badge                         ↑ Start Session button
```

**Status Progression**:

```
[مسودة] DRAFT
    ↓ (add schedule)
[مجدولة] SCHEDULED
    ↓ (add external link)
[جاهزة] READY  ← Green, "رابط متوفر ✓"
    ↓ (click بدء الجلسة)
[نشطة] ACTIVE  ← Bright green, pulsing
    ↓ (click إنهاء الجلسة)
[مكتملة] COMPLETED ← Gray
```

### When Session is ACTIVE:

```
║  [🔴 نشطة] جلسة مباشرة              [انضمام للجلسة]  ║
   ↑ Pulsing green                      ↑ Join button
```

**Click "انضمام للجلسة"**:

```
→ NEW TAB OPENS
→ Zoom/Meet/Teams loads
→ Original tab stays on dashboard
```

---

## 🎓 TEST 5: STUDENT DASHBOARD

### Normal View (No Active Sessions):

```
╔═══════════════════════════════════════════════════════════╗
║  [Logout] ← مرحباً Ali Student                            ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  📊 لوحة تحكم الطالب                                      ║
║                                                            ║
║  صفك: المستوى الأول                                       ║
║                                                            ║
║  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         ║
║  │   4    │  │   8    │  │   6    │  │  85%   │         ║
║  │ المسارات│  │ القادمة│  │ المكتملة│  │ الحضور │         ║
║  └────────┘  └────────┘  └────────┘  └────────┘         ║
║                                                            ║
║  المسارات المتاحة                                         ║
║  ┌─────────────────────────────────────────────┐         ║
║  │ Mathematics Track            [عرض الجلسات]  │         ║
║  │ Instructor: Ahmed │ Sessions: 4             │         ║
║  └─────────────────────────────────────────────┘         ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

### With Active Session - CRITICAL VISUAL:

```
╔═══════════════════════════════════════════════════════════╗
║  [Logout] ← مرحباً Ali Student                            ║
╠═══════════════════════════════════════════════════════════╣
║ ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ ║
║ ║ 🔴 جلسة مباشرة الآن!                                   ║ ║
║ ║ Math Session 1 - Instructor Ahmed   [انضم الآن →]     ║ ║  ← GREEN PULSING BANNER
║ ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ ║
║                                                            ║
║  📊 لوحة تحكم الطالب                                      ║
║  ...                                                       ║
╚═══════════════════════════════════════════════════════════╝
```

**Check**:

- ✅ Banner appears at TOP of page
- ✅ Bright green/red color (high contrast)
- ✅ Shows session title
- ✅ Shows instructor name
- ✅ "انضم الآن" (Join Now) button prominent
- ✅ May pulse or animate to grab attention

**Click "انضم الآن"**:

```
→ NEW TAB OPENS automatically
→ Zoom/Meet/Teams meeting URL loads
→ Student dashboard stays open in original tab
```

---

## 🔴 TEST 6: EXTERNAL PLATFORM OPENS

### What Should Happen:

**Step 1**: Click "انضم الآن" or "انضمام للجلسة"

**Step 2**: Browser behavior

```
🌐 New tab/window opens
⏳ Loading... (Zoom/Meet/Teams page)
```

**Step 3**: For Zoom

```
╔═══════════════════════════════════╗
║                                    ║
║     [Zoom Logo]                   ║
║                                    ║
║   Join Meeting                    ║
║   Meeting ID: 1234567890          ║
║                                    ║
║   [Launch Meeting] [Join from     ║
║                     browser]      ║
║                                    ║
╚═══════════════════════════════════╝
```

**Step 4**: For Google Meet

```
╔═══════════════════════════════════╗
║                                    ║
║     [Google Meet Logo]            ║
║                                    ║
║   Ready to join?                  ║
║   abc-defg-hij                    ║
║                                    ║
║   [Ask to join]                   ║
║                                    ║
╚═══════════════════════════════════╝
```

**Check**:

- ✅ Meeting URL is correct
- ✅ Platform recognizes meeting ID/code
- ✅ Can click "Join" or "Launch Meeting"
- ✅ Original dashboard tab still accessible

---

## ❌ WHAT SHOULD FAIL (Negative Tests)

### Test 1: Session Without Link Cannot Start

```
║  [مسودة] لم يتم إضافة رابط خارجي     [بدء الجلسة]  ║
                                            ↑ Button DISABLED (grayed out)
```

**If you try to click disabled button**:

```
Nothing happens
OR
❌ Error tooltip: "يجب إضافة رابط خارجي أولاً"
```

### Test 2: Student Cannot Access Instructor Dashboard

**Try**: Manually navigate to `/instructor/dashboard`

**Result 1**: Redirect

```
URL changes from:  /instructor/dashboard
                ↓
URL changes to:    /student/dashboard
```

**Result 2**: 403 Page

```
╔═══════════════════════════════════╗
║                                    ║
║     ⛔ 403                         ║
║     Forbidden                     ║
║                                    ║
║  You don't have permission        ║
║  to access this page              ║
║                                    ║
║     [← Go Back]                   ║
║                                    ║
╚═══════════════════════════════════╝
```

### Test 3: Invalid External Link Rejected

**Try**: Enter `http://zoom.us/j/123`

**Should see**:

```
❌ يجب استخدام HTTPS للأمان
```

(Red error message: "Must use HTTPS for security")

**Save button**: DISABLED (grayed out)

---

## 🎯 SUCCESS VISUAL INDICATORS

### ✅ Everything Working:

1. **Login**:

   - ✅ Redirects to correct dashboard
   - ✅ No errors in browser console (F12)
   - ✅ User name appears in header

2. **External Link Added**:

   - ✅ Green badge: "رابط متوفر ✓"
   - ✅ Button changes to "بدء الجلسة"
   - ✅ Session status = "READY"

3. **Session Started**:

   - ✅ Badge changes to "نشطة" (green/pulsing)
   - ✅ Button changes to "انضمام للجلسة"
   - ✅ External link opens in NEW tab

4. **Student Sees Active Session**:

   - ✅ Green banner at top of dashboard
   - ✅ "جلسة مباشرة الآن!" text visible
   - ✅ Join button works

5. **External Platform Loads**:
   - ✅ New tab opens automatically
   - ✅ Zoom/Meet/Teams page loads
   - ✅ Meeting ID/code preserved
   - ✅ Can join meeting

---

## 🐛 FAILURE VISUAL INDICATORS

### ❌ Something's Wrong:

1. **Red Console Errors** (F12):

```
❌ Error: Cannot read property 'externalLink' of undefined
❌ Failed to fetch: 500 Internal Server Error
❌ Uncaught TypeError: ...
```

2. **Infinite Loading**:

```
⏳⏳⏳ Loading... (never stops)
```

3. **Blank Page**:

```
(white screen, nothing renders)
```

4. **Wrong Redirect**:

```
Login as student → Goes to /instructor/dashboard ❌
(Should go to /student/dashboard)
```

5. **Link Doesn't Open**:

```
Click "Join" button → Nothing happens
(No new tab, no navigation)
```

6. **External Platform 404**:

```
🌐 New tab opens but shows:
"Meeting not found" or "Invalid meeting ID"
```

---

## 📱 MOBILE VIEW (Optional)

### Should Look Like:

```
╔═══════════════════╗
║ [☰] Dashboard     ║
╠═══════════════════╣
║                   ║
║ 🔴 جلسة مباشرة!  ║
║ [انضم الآن]      ║
║                   ║
║ ┌───────────────┐ ║
║ │      4        │ ║
║ │   المسارات    │ ║
║ └───────────────┘ ║
║                   ║
║ ┌───────────────┐ ║
║ │      8        │ ║
║ │   الجلسات     │ ║
║ └───────────────┘ ║
║                   ║
║ ┌───────────────┐ ║
║ │ Math Track    │ ║
║ │ [عرض الجلسات]│ ║
║ └───────────────┘ ║
║                   ║
╚═══════════════════╝
```

**Check**:

- ✅ Single column layout
- ✅ Stat cards full width
- ✅ Text readable (not too small)
- ✅ Buttons tappable (min 44x44px)
- ✅ No horizontal scrolling

---

## 🔧 BROWSER DEVELOPER TOOLS

### What to Check (F12):

**Console Tab**:

```
✅ Good:
   ⚠️ Warning: @next/font deprecated (OK, non-critical)

❌ Bad:
   ❌ Error: Cannot read property...
   ❌ Failed to fetch
   ❌ Uncaught TypeError
```

**Network Tab**:

```
✅ Good:
   GET /api/sessions     200    85ms
   GET /api/grades       200    120ms

❌ Bad:
   GET /api/sessions     500    Internal Server Error
   GET /api/tracks       401    Unauthorized
   GET /api/students     403    Forbidden
```

**Application Tab → Cookies**:

```
✅ Check for:
   next-auth.session-token    (JWT token present)
```

---

## 📝 TESTING CHECKLIST QUICK REFERENCE

```
Phase 1: Authentication
□ Login page loads (Arabic RTL)
□ Empty validation works
□ Invalid credentials rejected
□ Valid login redirects to dashboard
□ Logout returns to signin
□ All 5 roles tested

Phase 2: External Links
□ Modal opens
□ Invalid links show red error
□ HTTP rejected (must be HTTPS)
□ Zoom link validates ✅
□ Google Meet validates ✅
□ Teams validates ✅
□ Badge changes to "رابط متوفر ✓"

Phase 3: Start Session
□ "بدء الجلسة" button appears
□ Click starts session
□ Status changes to "نشطة"
□ Button changes to "انضمام"
□ Click join opens NEW tab
□ External platform loads
□ Meeting page shows correct ID

Phase 4: Student Join
□ Login as student
□ Green banner appears
□ "جلسة مباشرة الآن!" visible
□ "انضم الآن" button works
□ NEW tab opens
□ Student can access meeting
□ Both instructor & student in same meeting

Phase 5: Access Control
□ Student → instructor dashboard = BLOCKED
□ Instructor → manager pages = BLOCKED
□ API calls without auth = 401
□ API calls wrong role = 403
```

---

## 🎯 TIME ESTIMATES

| Test                    | Time       | Difficulty    |
| ----------------------- | ---------- | ------------- |
| Login (all roles)       | 5 min      | ⭐ Easy       |
| External links          | 10 min     | ⭐⭐ Medium   |
| Start session           | 5 min      | ⭐ Easy       |
| Student join            | 10 min     | ⭐⭐ Medium   |
| Access control          | 5 min      | ⭐ Easy       |
| **Total Critical Path** | **35 min** | ⭐⭐ Moderate |

---

## 💡 PRO TIPS

1. **Use Two Browsers**: Chrome for instructor, Firefox for student (easier than logging in/out)
2. **Keep F12 Open**: Catch errors immediately
3. **Test External Link First**: If this fails, whole system won't work
4. **Take Screenshots**: Of any errors for debugging
5. **Check Both Tabs**: When external link opens, verify both tabs

---

## ✅ YOU'RE READY TO TEST!

**Start with**: `QUICK_TEST_CHECKLIST.md`  
**Use this guide**: To know what success looks like  
**Time needed**: 30-40 minutes  
**Result**: Clear GO/NO-GO for production

**Good luck! 🚀**
