# 🎯 Complete Testing Scenario for Andrino Academy

## 📋 Test Credentials

### Administrative Accounts

```
CEO Account:
Email: ceo@andrino-academy.com
Password: Andrino2024!
Role: CEO (Full system access)

Manager Account:
Email: manager@andrino-academy.com
Password: Manager2024!
Role: Manager (Academic management)

Coordinator Account:
Email: coordinator@andrino-academy.com
Password: Coord2024!
Role: Coordinator (Track & session coordination)
```

### Instructor Accounts

```
Instructor 1 - Programming:
Email: ahmed.instructor@andrino-academy.com
Password: Instructor123!
Role: Instructor
Specialization: Programming & Web Development

Instructor 2 - Design:
Email: sara.instructor@andrino-academy.com
Password: Instructor123!
Role: Instructor
Specialization: UI/UX Design & Graphics

Instructor 3 - Data Science:
Email: omar.instructor@andrino-academy.com
Password: Instructor123!
Role: Instructor
Specialization: Data Science & AI
```

### Student Accounts

```
Student 1 - Beginner Level:
Email: ali.student@andrino-academy.com
Password: Student123!
Age: 8
Grade: المستوى الأول (Beginner)

Student 2 - Elementary Level:
Email: fatima.student@andrino-academy.com
Password: Student123!
Age: 11
Grade: المستوى الثاني (Elementary)

Student 3 - Intermediate Level:
Email: mohammed.student@andrino-academy.com
Password: Student123!
Age: 15
Grade: المستوى الثالث (Intermediate)

Student 4 - Advanced Level:
Email: aisha.student@andrino-academy.com
Password: Student123!
Age: 18
Grade: المستوى الرابع (Advanced)

Student 5 - Unassigned:
Email: hassan.student@andrino-academy.com
Password: Student123!
Age: 12
Grade: Not assigned (for testing manager dashboard)
```

---

## 🧪 Testing Scenarios

### Scenario 1: CEO Dashboard Testing

**Login as:** ceo@andrino-academy.com / Andrino2024!

**Expected Features:**

- Complete system overview
- All users statistics
- Revenue and financial metrics
- System health indicators
- Global analytics

**Test Steps:**

1. Login and verify welcome message shows CEO name
2. Check user statistics show correct counts
3. Verify all metrics are displaying
4. Test navigation to other sections

---

### Scenario 2: Manager Dashboard Testing

**Login as:** manager@andrino-academy.com /  

**Expected Features:**

- Grade management interface
- Unassigned students tracking
- Track overview across all grades
- Academic statistics

**Test Steps:**

1. Login and verify academic focus of dashboard
2. Check "المستويات الدراسية" shows 4 grades
3. Verify "الطلاب غير المسجلين" shows 1 unassigned student (Hassan)
4. Check tracks display with instructor assignments
5. Test grade creation and student assignment features

---

### Scenario 3: Coordinator Dashboard Testing

**Login as:** coordinator@andrino-academy.com / Coord2024!

**Expected Features:**

- Track coordination tools
- Session management for today
- Upcoming sessions overview
- Instructor management

**Test Steps:**

1. Login and verify coordinator-specific interface
2. Check today's sessions section
3. Verify track management shows all tracks
4. Test session scheduling interface
5. Check upcoming sessions display

---

### Scenario 4: Instructor Dashboard Testing

**Login as:** ahmed.instructor@andrino-academy.com / Instructor123!

**Expected Features:**

- Personal track management
- Today's sessions with controls
- Student progress tracking
- Session creation tools

**Test Steps:**

1. Login and verify instructor name display
2. Check "مساراتي" shows assigned tracks only
3. Verify today's sessions with start/stop controls
4. Test session attendance management
5. Check upcoming sessions for this instructor

---

### Scenario 5: Student Dashboard Testing

#### Student with Grade Assignment

**Login as:** ali.student@andrino-academy.com / Student123!

**Expected Features:**

- Grade level display (المستوى الأول)
- Available tracks for grade level
- Upcoming sessions
- Attendance history

**Test Steps:**

1. Login and verify grade level shows "المستوى الأول"
2. Check available tracks for beginner level
3. Verify upcoming sessions display
4. Test attendance history section

#### Unassigned Student

**Login as:** hassan.student@andrino-academy.com / Student123!

**Expected Features:**

- Warning about unassigned grade
- Empty state messages
- Request for grade assignment

**Test Steps:**

1. Login and verify warning message appears
2. Check that grade shows "غير محدد"
3. Verify empty states for tracks and sessions
4. Confirm helpful guidance messages

---

## 🏗️ Academic Structure to Test

### Grades (المستويات)

1. **المستوى الأول** (Beginner) - Ages 6-8
2. **المستوى الثاني** (Elementary) - Ages 9-12
3. **المستوى الثالث** (Intermediate) - Ages 13-16
4. **المستوى الرابع** (Advanced) - Ages 17+

### Tracks per Grade

#### المستوى الأول (Beginner)

- أساسيات الحاسوب (Computer Basics)
- البرمجة للأطفال (Kids Programming)

#### المستوى الثاني (Elementary)

- برمجة سكراتش (Scratch Programming)
- تصميم الألعاب البسيطة (Simple Game Design)

#### المستوى الثالث (Intermediate)

- تطوير المواقع (Web Development)
- البرمجة بـ Python (Python Programming)

#### المستوى الرابع (Advanced)

- تطوير التطبيقات (App Development)
- الذكاء الاصطناعي (Artificial Intelligence)

### Live Sessions Schedule

**Today's Sessions:**

- 10:00 AM - أساسيات الحاسوب (Computer Basics)
- 2:00 PM - برمجة سكراتش (Scratch Programming)
- 4:00 PM - تطوير المواقع (Web Development)

**This Week's Upcoming:**

- Tomorrow: Python Programming, AI Basics
- Tuesday: Game Design, App Development
- Wednesday: Web Development Advanced
- Thursday: Computer Graphics
- Friday: Project Presentations

---

## ✅ Key Testing Checkpoints

### Authentication & Authorization

- [ ] All login credentials work correctly
- [ ] Role-based redirects function properly
- [ ] Unauthorized access is blocked
- [ ] Session management works

### Data Display & Integration

- [ ] Real data loads from APIs
- [ ] Loading states appear and disappear
- [ ] Empty states show appropriate messages
- [ ] Error handling works gracefully

### Role-Specific Features

- [ ] Each dashboard shows role-appropriate content
- [ ] Permissions are enforced correctly
- [ ] Navigation is role-specific
- [ ] Data filtering works by role

### Arabic & RTL Support

- [ ] All text displays in Arabic correctly
- [ ] RTL layout is consistent
- [ ] Date/time formatting is Arabic
- [ ] Icons and layouts are RTL-appropriate

### Responsive Design

- [ ] Mobile view works correctly
- [ ] Tablet view is functional
- [ ] Desktop view is optimal
- [ ] Touch interactions work on mobile

---

## 🚀 Quick Start Testing Commands

1. **Start the application:**

```bash
npm run dev
```

2. **Access the application:**

```
http://localhost:3000
```

3. **Begin testing sequence:**
   - Start with CEO account for full overview
   - Test Manager for academic management
   - Verify Coordinator for session management
   - Check Instructor for teaching tools
   - End with Student accounts for learner experience

---

## 📊 Expected Results Summary

**All dashboards should:**

- Load without errors
- Display real data from the database
- Show appropriate Arabic content
- Respond correctly to user interactions
- Maintain consistent UI/UX

**The academic management system should:**

- Support the complete Grade→Track→Session hierarchy
- Handle student assignments correctly
- Manage instructor-track relationships
- Track session scheduling and attendance
- Provide role-based data access

This testing scenario covers the complete academic management system integration across all user roles!
