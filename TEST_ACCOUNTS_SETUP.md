# Test Accounts Setup Guide

## Overview

The Andrino Academy application seeds test accounts for different roles upon database initialization. These accounts use secure passwords that can be customized via environment variables.

## Default Test Accounts

### Primary Test Accounts

| Role | Email | Default Password | Environment Variable |
|------|-------|-----------------|---------------------|
| CEO | `ceo@andrino-academy.com` | `CEO#2024!Secure` | `TEST_CEO_PASSWORD` |
| Testing Manager | `manager@andrino-academy.com` | `Manager#2024!Secure` | `TEST_MANAGER_PASSWORD` |
| Coordinator | `coordinator@andrino-academy.com` | `Coordinator#2024!Secure` | `TEST_COORDINATOR_PASSWORD` |
| Instructor | `instructor@andrino-academy.com` | `Instructor#2024!Secure` | `TEST_INSTRUCTOR_PASSWORD` |
| Student | `student@andrino-academy.com` | `Student#2024!Secure` | `TEST_STUDENT_PASSWORD` |

### Additional Accounts

**Additional Instructors** (use same password as instructor@andrino-academy.com):
- `ahmed.instructor@andrino-academy.com`
- `sara.instructor@andrino-academy.com`
- `omar.instructor@andrino-academy.com`

**Additional Students** (use same password as student@andrino-academy.com):
- `ali.student@andrino-academy.com`
- `fatima.student@andrino-academy.com`
- `mohammed.student@andrino-academy.com`
- `aisha.student@andrino-academy.com`
- `hassan.student@andrino-academy.com`

## Setting Custom Passwords

### For Production Deployment

**IMPORTANT**: Always set custom secure passwords in production!

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your custom passwords:
   ```env
   TEST_CEO_PASSWORD="YourSecure!CEO!Pass2024"
   TEST_MANAGER_PASSWORD="YourSecure!Manager!Pass2024"
   TEST_COORDINATOR_PASSWORD="YourSecure!Coordinator!Pass2024"
   TEST_INSTRUCTOR_PASSWORD="YourSecure!Instructor!Pass2024"
   TEST_STUDENT_PASSWORD="YourSecure!Student!Pass2024"
   ```

3. Ensure your `.env` file is in `.gitignore` and never committed to version control

### Password Requirements

For secure passwords, follow these guidelines:
- Minimum 12 characters
- Include uppercase and lowercase letters
- Include numbers
- Include special characters (!@#$%^&*)
- Avoid common words or patterns

## Seeding the Database

To seed or re-seed the database with test accounts:

```bash
# Seed the database
npm run db:seed

# Or reset and seed
npm run db:reset
```

## Docker/Production Environment

When deploying with Docker or to production environments (like Coolify), set the environment variables in your deployment configuration:

```yaml
# docker-compose.yml or Coolify environment variables
environment:
  - TEST_CEO_PASSWORD=YourSecure!CEO!Pass2024
  - TEST_MANAGER_PASSWORD=YourSecure!Manager!Pass2024
  - TEST_COORDINATOR_PASSWORD=YourSecure!Coordinator!Pass2024
  - TEST_INSTRUCTOR_PASSWORD=YourSecure!Instructor!Pass2024
  - TEST_STUDENT_PASSWORD=YourSecure!Student!Pass2024
```

## Security Best Practices

1. **Never hardcode passwords** in the seed file
2. **Always use environment variables** for sensitive data
3. **Use strong, unique passwords** for each role
4. **Rotate passwords regularly** in production
5. **Limit access** to environment files
6. **Use a password manager** to generate and store secure passwords
7. **Enable 2FA** where possible (future enhancement)

## Troubleshooting

### Passwords not working after seed

1. Verify environment variables are loaded:
   ```bash
   echo $TEST_MANAGER_PASSWORD
   ```

2. Check the seed output for the passwords being used

3. Re-run the seed command:
   ```bash
   npm run db:reset
   ```

### Environment variables not loading

1. Ensure `.env` file exists in the project root
2. Check file permissions (should be readable)
3. Restart your development server after changing `.env`
4. For production, ensure environment variables are set in your deployment platform

## Future Enhancements

- [ ] Password rotation mechanism
- [ ] Two-factor authentication
- [ ] Account lockout after failed attempts
- [ ] Password complexity enforcement
- [ ] Audit logging for account access
