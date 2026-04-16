# Multiple Parent Emails Support - Implementation Guide

## What's Changed

### Backend Updates ✅ (Complete)

1. **Database Model** (`src/models/User.ts`)
   - Changed `parentEmail` (string) → `parentEmails` (array of strings)
   - Validation ensures all emails end with @gmail.com

2. **API Routes** (`src/app/api/auth/profile-settings/route.ts`)
   - GET: Returns `parentEmails: string[]`
   - PUT: Accepts `parentEmails: string[]` and validates each email

3. **Email Service** (`src/lib/emailService.ts`)
   - Updated to send emails to all parent emails in the array
   - Loops through each parent email and sends notification
   - Parameter changed from `parentEmail` → `parentEmails`

4. **Test API** (`src/app/api/tests/route.ts`)
   - Passes `parentEmails` array to email service
   - Sends test notification emails to all parents

5. **Type Definitions** (`src/types/index.ts`)
   - Updated `IUser` interface: `parentEmail?` → `parentEmails?`

---

## Frontend Updates Needed

### Profile Form Component

Your profile component needs to be updated to:
1. Display multiple parent email input fields
2. Allow adding/removing parent emails
3. Send `parentEmails` array in the profile update request

### Example Structure:

```typescript
interface ProfileFormData {
  studentName: string;
  studentEmail: string;
  parentName: string;
  parentEmails: string[];  // Changed from parentEmail
  targetMarks: number;
}
```

### Key Changes in Profile Component:

1. **State Management**
   ```typescript
   const [parentEmails, setParentEmails] = useState<string[]>([]);
   ```

2. **Add Parent Email Input**
   - Render multiple input fields for parent emails
   - Add button to add new parent email field
   - Remove button for each parent email

3. **Handle Add/Remove**
   ```typescript
   const addParentEmail = () => {
     setParentEmails([...parentEmails, '']);
   };
   
   const removeParentEmail = (index: number) => {
     setParentEmails(parentEmails.filter((_, i) => i !== index));
   };
   
   const updateParentEmail = (index: number, value: string) => {
     const updated = [...parentEmails];
     updated[index] = value;
     setParentEmails(updated);
   };
   ```

4. **API Call Format**
   ```typescript
   // When sending to API
   const payload = {
     studentName,
     studentEmail,
     parentName,
     parentEmails,  // Send as array
     targetMarks,
   };
   
   const response = await fetch('/api/auth/profile-settings', {
     method: 'PUT',
     headers: { 'Authorization': `Bearer ${token}` },
     body: JSON.stringify(payload),
   });
   ```

---

## API Endpoint Examples

### GET Profile
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/auth/profile-settings
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "student@gmail.com",
    "name": "...",
    "studentEmail": "student@gmail.com",
    "parentEmails": ["parent1@gmail.com", "parent2@gmail.com"],
    "parentName": "Parent Name",
    "targetMarks": 650
  }
}
```

### UPDATE Profile
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "parentEmails": ["parent1@gmail.com", "parent2@gmail.com"]
  }' \
  http://localhost:3000/api/auth/profile-settings
```

---

## Email Notifications

When a test is submitted:
- ✅ Email sent to **student email**
- ✅ Email sent to **each parent email** in the array
- ✅ Each email includes the full PDF report attachment
- ✅ Parent emails customize the subject with student name

### Example: 3 Parent Emails
If `parentEmails = ["mom@gmail.com", "dad@gmail.com", "grandma@gmail.com"]`

Then:
1. 1 email → student
2. 1 email → mom@gmail.com
3. 1 email → dad@gmail.com
4. 1 email → grandma@gmail.com

Total = 4 emails per test submission

---

## Validation Rules

✅ All parent emails must end with `@gmail.com`
✅ Empty strings are filtered out automatically
✅ Duplicate emails are not prevented (system will send to same email twice if added twice)

---

## Testing the Feature

1. **Update Profile** with multiple parent emails:
   ```json
   {
     "parentEmails": ["parent1@gmail.com", "parent2@gmail.com"]
   }
   ```

2. **Create a Test** with any score

3. **Check Emails**:
   - Student should receive email
   - Both parents should receive their own email
   - Each email includes the PDF report
   - Subject line shows student name for parent emails

---

## Database Migration Note

⚠️ **If you have existing users:**
- Users with old `parentEmail` field will need migration
- Consider running a migration script to convert `parentEmail` → `parentEmails: [parentEmail]`
- Or just overwrite with empty array on next profile update

---

## Summary of Changes

| Component | Old | New | Status |
|-----------|-----|-----|--------|
| User Model | `parentEmail: string` | `parentEmails: [string]` | ✅ Done |
| API Schema | `parentEmail?` | `parentEmails?` | ✅ Done |
| Email Service | Single email | Multiple emails | ✅ Done |
| Test API | Single parent | Multiple parents | ✅ Done |
| Frontend Form | Single input | Multiple inputs | ⏳ TODO |

Backend is 100% ready. Just update your profile form component to handle the array! 🚀
