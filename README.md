# STPeak Task Tracker

A simple task tracking web application built with Node.js and Express.

## Setup

```bash
npm install
```

## Running

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## Testing

```bash
npm test
```

## API Endpoints

- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a task
- `GET /api/tasks/:id` - Get a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/complete` - Mark task complete
- `GET /api/tasks/search/:query` - Search tasks
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Delete user
- `GET /api/stats` - Task statistics
- `GET /api/stats/overdue` - Overdue tasks
- `GET /api/stats/summary` - Summary report
