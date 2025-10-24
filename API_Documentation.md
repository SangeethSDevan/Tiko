# Tiko Backend API Documentation

### Content Type
All requests should use `Content-Type: application/json`

### Response Format
All responses follow this structure:
```json
{
  "status": "success" | "fail",
  "message": "Response message",
  "data": {} // Additional response data
}
```

---

## Authentication

Most endpoints require JWT authentication via the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The JWT token contains the user ID and is signed with `process.env.JWT_SECRET`.

---

## User Routes

### 1. User Signup
- **POST** `/api/v1/user/signup`
- **Authentication:** Not required
- **Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123!"
}
```
- **Validation Rules:**
  - All fields are required
  - Email must match email regex pattern
  - Password must match password regex pattern
  - Username must match username regex pattern
  - Username and email must be unique

- **Success Response (201):**
```json
{
  "status": "success",
  "message": "Welcome John Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Error Response (400):**
```json
{
  "status": "fail",
  "message": "email is already taken!"
}
```

---

### 2. User Login
- **POST** `/api/v1/user/login`
- **Authentication:** Not required
- **Body:**
```json
{
  "credential": "john@example.com",
  "password": "Password123!"
}
```

- **Success Response (200):**
```json
{
  "status": "success",
  "message": "Welcome back John Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "events": [
    {
      "eventId": "evt_123",
      "eventDate": "2025-10-20T18:00:00.000Z",
      "title": "Personal Meeting",
      "description": "Important meeting",
      "reccurence": "NONE"
    }
  ],
  "group": [
    {
      "group": {
        "groupName": "Chess Club",
        "description": "Chess lovers group",
        "members": [...],
        "events": [...]
      }
    }
  ]
}
```

---

### 3. Get User Groups
- **GET** `/api/v1/user/group`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "groups": [
    {
      "groupId": "grp_123",
      "group": {
        "groupName": "Chess Club",
        "description": "A group for chess lovers",
        "members": [
          {
            "userId": "user_456",
            "userRole": "ADMIN",
            "user": {
              "username": "johndoe",
              "name": "John Doe",
              "email": "john@example.com"
            }
          }
        ],
        "events": [
          {
            "eventId": "evt_789",
            "title": "Weekly Chess Match",
            "description": "Regular chess tournament",
            "eventDate": "2025-10-20T18:00:00.000Z",
            "reccurence": "WEEKLY"
          }
        ]
      }
    }
  ]
}
```

---

### 4. Get Personal Events
- **GET** `/api/v1/user/personal`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "events": [
    {
      "eventId": "evt_123",
      "title": "Doctor Appointment",
      "description": "Annual checkup",
      "eventDate": "2025-10-25T10:00:00.000Z",
      "reccurence": "YEARLY"
    }
  ]
}
```

---

### 5. Get User Details
- **GET** `/api/v1/user/details`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "details": {
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "events": [...],  // Personal events only
    "groups": [...]   // Same structure as Get User Groups
  }
}
```

---

## Group Routes

### 1. Create Group
- **POST** `/api/v1/group`
- **Authentication:** Required
- **Body:**
```json
{
  "groupName": "Chess Club",
  "description": "A group for chess enthusiasts"  // Optional
}
```

- **Success Response (201):**
```json
{
  "status": "success",
  "message": "Group was created",
  "group": {
    "groupId": "grp_123",
    "groupName": "Chess Club",
    "description": "A group for chess enthusiasts",
    "createdBy": "user_456"
  }
}
```

**Note:** The user who creates the group automatically becomes an ADMIN member.

---

### 2. Update Group
- **PUT** `/api/v1/group/:id`
- **Authentication:** Required (ADMIN role only)
- **Body:**
```json
{
  "groupName": "Advanced Chess Club",
  "description": "Updated description"
}
```

- **Success Response (200):**
```json
{
  "status": "success",
  "group": {
    "groupId": "grp_123",
    "groupName": "Advanced Chess Club",
    "description": "Updated description",
    "createdBy": "user_456"
  }
}
```

---

### 3. Delete Group
- **DELETE** `/api/v1/group/:id`
- **Authentication:** Required (ADMIN role only)
- **Success Response (200):**
```json
{
  "status": "success",
  "message": "The Group was deleted!"
}
```

---

## Event Routes

### 1. Create Event
- **POST** `/api/v1/event`
- **Authentication:** Required
- **Body:**
```json
{
  "title": "Chess Tournament",
  "description": "Monthly chess competition",
  "eventDate": "2025-10-25T18:00:00.000Z",
  "reccurence": "MONTHLY",
  "groupId": "grp_123"  // Optional - if not provided, creates personal event
}
```

**Recurrence Types:** `NONE`, `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`

- **Success Response (201):**
```json
{
  "status": "success",
  "message": "Event addded to your list!",
  "event": {
    "eventId": "evt_123",
    "userId": "user_456",
    "title": "Chess Tournament",
    "description": "Monthly chess competition",
    "eventDate": "2025-10-25T18:00:00.000Z",
    "ddmm": "25-10",
    "reccurence": "MONTHLY",
    "groupId": "grp_123"
  }
}
```

---

### 2. Get Personal Events
- **GET** `/api/v1/event`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "events": [
    {
      "eventId": "evt_123",
      "title": "Personal Meeting",
      "description": "Important client meeting",
      "reccurence": "NONE",
      "eventDate": "2025-10-20T14:00:00.000Z"
    }
  ]
}
```

**Note:** Only returns personal events (groupId is null).

---

### 3. Get Event by ID
- **GET** `/api/v1/event/:id`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "event": {
    "eventId": "evt_123",
    "eventDate": "2025-10-20T14:00:00.000Z",
    "title": "Personal Meeting",
    "description": "Important client meeting",
    "reccurence": "NONE"
  }
}
```

---

### 4. Update Event
- **PUT** `/api/v1/event/:id`
- **Authentication:** Required
- **Body:**
```json
{
  "title": "Updated Chess Tournament",
  "description": "Updated monthly chess competition",
  "eventDate": "2025-10-26T18:00:00.000Z",
  "reccurence": "MONTHLY"
}
```

- **Success Response (200):**
```json
{
  "status": "success",
  "message": "The Event was updated!",
  "event": {
    "eventId": "evt_123",
    "eventDate": "2025-10-26T18:00:00.000Z",
    "title": "Updated Chess Tournament",
    "description": "Updated monthly chess competition",
    "reccurence": "MONTHLY"
  }
}
```

---

### 5. Delete Event
- **DELETE** `/api/v1/event/:id`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "message": "Event deleted successfully!"
}
```

---

## Member Routes

### 1. Join Group
- **POST** `/api/v1/group/member/join?gid=:groupId`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "message": "Successfully joined the group!"
}
```

**Note:** This endpoint is typically used via invitation links.

---

### 2. Update Member Role
- **POST** `/api/v1/group/member/role?gid=:groupId&uid=:userId`
- **Authentication:** Required (ADMIN or LEADER role)
- **Body:**
```json
{
  "role": "LEADER"
}
```

**Available Roles:** `ADMIN`, `LEADER`, `USER`

**Role Hierarchy Rules:**
- LEADER cannot modify ADMIN roles
- LEADER cannot promote users to ADMIN

- **Success Response (200):**
```json
{
  "status": "success",
  "message": "Role updated to LEADER"
}
```

---

### 3. Exit Group
- **POST** `/api/v1/group/member/exit?gid=:groupId`
- **Authentication:** Required
- **Success Response (200):**
```json
{
  "status": "success",
  "message": "You successfully exited the group!"
}
```

---

### 4. Kick Member from Group
- **POST** `/api/v1/group/member/kick?gid=:groupId&uid=:userId`
- **Authentication:** Required (ADMIN or LEADER role)
- **Success Response (200):**
```json
{
  "status": "success",
  "message": "The member was removed from the group!"
}
```

**Restrictions:**
- LEADER cannot kick ADMIN or LEADER members
- ADMIN can kick anyone except other ADMINs

---

### 5. Add Members via Email Invitation
- **POST** `/api/v1/group/member/add?gid=:groupId`
- **Authentication:** Required (ADMIN role only)
- **Body:**
```json
{
  "emails": [
    "newmember1@example.com",
    "newmember2@example.com"
  ]
}
```

- **Success Response (200):**
```json
{
  "status": "success",
  "message": "Invitations sent successfully!"
}
```

- **Partial Success Response (200):**
```json
{
  "status": "partial_success",
  "message": "Invitation sent, but failed for: invalid@email.com"
}
```

**Note:** This endpoint sends email invitations with join links to the specified email addresses.

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "status": "fail",
  "message": "All the fields are required"
}
```

**401 Unauthorized:**
```json
{
  "status": "fail",
  "message": "Invalid username or password"
}
```

**500 Internal Server Error:**
```json
{
  "status": "fail",
  "message": "Something went wrong!"
}
```

### Validation Errors

**Email Format Error:**
```json
{
  "status": "fail",
  "message": "Enter a valid email!"
}
```

**Password Format Error:**
```json
{
  "status": "fail",
  "message": "Enter a valid password!"
}
```

**Username Format Error:**
```json
{
  "status": "fail",
  "message": "Enter a valid username!"
}
```

**Duplicate Entry Error:**
```json
{
  "status": "fail",
  "message": "email is already taken!"
}
```

---

## Data Models

### User Role Hierarchy
1. **ADMIN** - Full permissions (group creator)
2. **LEADER** - Can manage members except ADMINs
3. **USER** - Basic member permissions

### Recurrence Types
- `NONE` - One-time event
- `DAILY` - Repeats daily
- `WEEKLY` - Repeats weekly
- `MONTHLY` - Repeats monthly
- `YEARLY` - Repeats yearly

### Date Formats
- All dates are stored and returned in ISO 8601 format
- Example: `"2025-10-20T18:00:00.000Z"`

### Key Database Relations
- Users can create multiple groups
- Users can be members of multiple groups with different roles
- Users can create personal events and group events
- Groups can have multiple members and events
- Events belong to either a user (personal) or a group

---

## Environment Variables Required

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
URL=your_base_url_for_invitation_links
```

---

## Notes

1. **Authentication Middleware:** Most endpoints use JWT-based authentication
2. **Role-based Access:** Some group management endpoints require specific roles
3. **Transaction Safety:** Critical operations use database transactions
4. **Email Integration:** Member invitation system sends emails with join links
5. **Validation:** Input validation is implemented for all user inputs
6. **Error Handling:** Comprehensive error handling with appropriate HTTP status codes

