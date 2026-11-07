
# Nudge API Contract

## 1. Authentication

All API endpoints are under `/api`.

Protected endpoints require JWT authentication.

Authentication header:

Authorization: Bearer <token>

## 2. Data Models

### User
- id
- email
- expoPushToken

### Task
- id
- title
- description
- dueAt
- priority: HIGH | MEDIUM | LOW
- status: TODO | IN_PROGRESS | DONE | SNOOZED
- sourceEmailId
- parentTaskId

### Subscription
- id
- merchant
- amount
- currency
- billingCycle: WEEKLY | MONTHLY | YEARLY
- nextChargeDate
- status: ACTIVE | CANCELLED
- sourceEmailId

### Email
- id
- subject
- sender
- receivedAt
- snippet

## 3. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/auth/google/start | Start Google login |
| POST | /api/emails/sync | Sync and analyze emails |
| GET | /api/dashboard/briefing | Get dashboard information |
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create a task |
| PATCH | /api/tasks/{id} | Update a task |
| DELETE | /api/tasks/{id} | Delete a task |
| POST | /api/tasks/{id}/breakdown | Generate task sub-steps |
| GET | /api/subscriptions | Get subscriptions |
| PATCH | /api/subscriptions/{id} | Update subscription |
| POST | /api/devices | Register push notification token |

## 4. Authentication Flow

1. Mobile app requests Google login.
2. Backend handles authentication.
3. Backend redirects to:

   nudge://auth?token=<jwt>

4. Mobile app stores the JWT securely.
5. Mobile app includes the JWT in protected API requests.
