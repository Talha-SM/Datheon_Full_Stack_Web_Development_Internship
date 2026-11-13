# TaskFlow — Productivity Workspace

Task 02 for the Datheon Full Stack Web Development Internship. A static HTML, CSS and vanilla JavaScript task manager.

## Start locally

Open this folder in VS Code. Launch index.html with Live Server, or run `py -m http.server 5502 --bind 127.0.0.1` and visit http://127.0.0.1:5502/. The second option needs Python 3.

## Use TaskFlow

Create or edit a task with a category, priority, due date and status. Search titles and descriptions, filter by status or category, and sort by date, title or priority. Choose Manual to drag rows or use their arrow buttons. The dashboard counts and completion progress come from your saved tasks.

## Verify persistence

Create a task, edit its due date, complete and reopen it. Refresh, then close and reopen the same URL in the same browser profile. Try Manual order, change the theme and reload again. Cancel one deletion with Escape, then confirm a deletion. Check that Today, Upcoming and Completed show the expected tasks.

Tasks and manual order are saved as a JSON array in localStorage under taskflow_tasks_v1. The array order represents manual order. Theme and List/Grid preferences are saved separately. If task data cannot be read, the app preserves the stored value and warns that changes are temporary. Data is local to the browser origin. Google Fonts have system fallbacks.

## Files

- index.html: dashboard, dialogs and task template
- styles.css: themes, components, motion and responsive layout
- app.js: task state, persistence, filtering, rendering and interactions

## Deploy

Import the GitHub repository in Vercel. Set the Root Directory to task-02-productivity-tracker, choose Other, and leave the build command blank. This app uses browser storage, so tasks created on localhost are separate from tasks created on the deployed URL.
