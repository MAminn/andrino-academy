# 🎓 Andrino Academy - Educational Management Platform

A comprehensive educational management system built with Next.js 15, featuring instructor availability management, multi-content upload, and role-based access control.

## 🚀 Features

### **Instructor Availability System**
- 📅 Weekly availability calendar with drag-select slots
- 🔒 Confirmation system to lock availability
- 📊 Week-based scheduling with automatic reset
- 🎯 Track-specific availability management
- ⏰ Configurable schedule settings (manager control)

### **Student Booking System**
- 🔍 Browse available instructor time slots
- 📝 Book sessions with personal notes
- 💬 Mutual notes system (student ↔ instructor)
- 🔗 Automatic session linking when instructor creates live session
- ❌ Cancellation support (before session creation)

### **Multi-Content Upload System**
- 📹 Video content (MP4, WebM, Ogg - up to 500MB)
- 📄 PDF documents (up to 50MB)
- 📝 Document files (DOC, DOCX - up to 50MB)
- 🖼️ Images (PNG, JPG, JPEG, WebP - up to 10MB)
- 🎯 Instructor vs Student content separation
- 📚 Teaching materials library for instructors
- ✅ Tasks and assignments with grading system

### **Assignment & Grading System**
- 📤 File-based assignment submissions (up to 20MB)
- 💯 Grading system (0-100 scale)
- 💬 Instructor feedback
- ⏱️ Due date tracking with overdue detection
- 📊 Status tracking (pending, submitted, graded, overdue)

### **Role-Based Access Control**
- 👨‍💼 **Manager/CEO**: Full system control, schedule settings, content management
- 👨‍🏫 **Instructor**: Availability management, bookings view, materials access, grading
- 👨‍🎓 **Student**: Session booking, content viewing, assignment submission
- 👔 **Coordinator**: Track oversight (existing functionality maintained)

### **Session Integration**
- 🔗 Live session creation with automatic booking link
- 📋 Show available bookings when creating sessions
- ✅ Multi-select booking linking
- 🎥 External meeting links (Zoom, Google Meet, Teams)
- 📊 Session status tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **UI**: Tailwind CSS, Lucide Icons
- **File Upload**: Native FormData API
- **Validation**: Zod (backend)

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd andrino-academy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and NextAuth secret

# Initialize database
npx prisma generate
npx prisma db push

# Seed database (optional)
npx prisma db seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🗄️ Database Schema

### **New Models (v2.0)**
- `InstructorAvailability` - Weekly availability slots
- `SessionBooking` - Student session bookings
- `ContentItem` - Multi-content upload (videos, PDFs, documents, images)
- `Task` - Text-based tasks for students
- `AssignmentNew` - File-based assignments
- `AssignmentSubmissionNew` - Student submissions with grading
- `ScheduleSettings` - Manager-controlled schedule configuration

### **Enhanced Models**
- `Module` - Enhanced with content items, tasks, and assignments
- `LiveSession` - Added bookings relation

## 🔑 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: External APIs
# Add any external service configurations
```

## 📚 API Routes

### **Instructor Availability**
- `GET /api/instructor/availability` - Get instructor's availability
- `POST /api/instructor/availability` - Create/update availability slots
- `PUT /api/instructor/availability/confirm` - Confirm and lock availability
- `GET /api/availability/[trackId]` - Get available slots by track
- `GET /api/instructor/bookings` - Get instructor's bookings

### **Student Booking**
- `POST /api/student/book-session` - Book a session
- `DELETE /api/student/book-session` - Cancel a booking
- `PUT /api/bookings/[id]/notes` - Update mutual notes

### **Content Management**
- `GET /api/modules/[id]/content` - Get module content items
- `POST /api/modules/[id]/content` - Upload content (multi-file)
- `PUT /api/modules/[id]/content/[contentId]` - Update content item
- `DELETE /api/modules/[id]/content/[contentId]` - Delete content item

### **Tasks & Assignments**
- `GET /api/modules/[id]/tasks` - Get module tasks
- `GET /api/modules/[id]/assignments` - Get module assignments
- `POST /api/assignments/[id]/submissions` - Submit assignment
- `PUT /api/assignments/[id]/submissions/[submissionId]/grade` - Grade submission

### **Schedule Settings**
- `GET /api/settings/schedule` - Get schedule settings
- `PUT /api/settings/schedule` - Update schedule settings (manager only)

## 🎨 UI Components

### **Instructor Components**
- `AvailabilityCalendar` - Interactive weekly availability grid
- `InstructorBookingsList` - View and manage student bookings
- `TeachingMaterials` - Browse instructor-targeted content

### **Student Components**
- `AvailableSessions` - Browse and book available sessions
- `MyBookings` - View bookings with notes and session links
- `AssignmentSubmission` - Submit assignments and view grades
- `ContentViewer` - View module content by type

### **Manager Components**
- `MultiContentUpload` - Upload multiple content types
- `ScheduleSettings` - Configure week reset and availability window

## 🔐 Authentication & Authorization

All routes are protected with NextAuth middleware:
- Session validation on every request
- Role-based page access control
- API route authorization checks
- Redirect to signin for unauthenticated users
- Unauthorized page for insufficient permissions

## 🌍 Internationalization

- Full Arabic RTL interface
- Arabic labels and messages
- Right-to-left layout support
- Date formatting in Arabic locale

## 📈 Performance Optimizations

- File size validation before upload
- Chunked file uploads for large files
- Optimistic UI updates
- Efficient database queries with Prisma
- Image optimization with Next.js Image component
- Lazy loading for content viewers

## 🧪 Testing

```bash
# TypeScript type checking
npx tsc --noEmit

# Build production bundle
npm run build

# Run production build
npm start
```

## 📝 Development Notes

### **File Upload Limits**
- Videos: 500MB (MP4, WebM, Ogg)
- PDFs: 50MB
- Documents: 50MB (DOC, DOCX)
- Images: 10MB (PNG, JPG, JPEG, WebP)
- Assignments: 20MB

### **Schedule Configuration**
- Week reset day: 0-6 (Sunday-Saturday)
- Week reset hour: 0-23 (24-hour format)
- Availability open window: Configurable hours before reset

### **Booking Rules**
- One booking per student per availability slot
- Bookings can be cancelled before session creation
- Automatic status update to "confirmed" when linked to session

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Tailwind CSS for utility-first styling
- Lucide for beautiful icons

---

**Built with ❤️ for Andrino Academy**
