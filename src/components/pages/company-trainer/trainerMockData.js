// Temporary frontend-only demo data.
// Remove/replace these fallbacks when the trainer backend endpoints are ready.

export const DUMMY_TRAINER_STUDENTS = [
  { id: "dummy-student-1", student: { user: { firstName: "Lina", lastName: "Hassan" }, major: "Software Engineering", email: "lina.hassan@example.com" } },
  { id: "dummy-student-2", student: { user: { firstName: "Omar", lastName: "Khaled" }, major: "Computer Science", email: "omar.khaled@example.com" } },
  { id: "dummy-student-3", student: { user: { firstName: "Sara", lastName: "Ali" }, major: "Information Technology", email: "sara.ali@example.com" } },
  { id: "dummy-student-4", student: { user: { firstName: "Yousef", lastName: "Nasser" }, major: "Software Engineering", email: "yousef.nasser@example.com" } },
  { id: "dummy-student-5", student: { user: { firstName: "Maya", lastName: "Saleh" }, major: "Computer Science", email: "maya.saleh@example.com" } },
];

export const DUMMY_TRAINER_APPLICATIONS = [
  { id: "dummy-app-1", student: { user: { firstName: "Lina", lastName: "Hassan" }, major: "Software Engineering" }, opportunity: { title: "Frontend Development Internship" } },
  { id: "dummy-app-2", student: { user: { firstName: "Omar", lastName: "Khaled" }, major: "Computer Science" }, opportunity: { title: "Frontend Development Internship" } },
  { id: "dummy-app-3", student: { user: { firstName: "Sara", lastName: "Ali" }, major: "Information Technology" }, opportunity: { title: "Frontend Development Internship" } },
  { id: "dummy-app-4", student: { user: { firstName: "Yousef", lastName: "Nasser" }, major: "Software Engineering" }, opportunity: { title: "Frontend Development Internship" } },
];

export const DUMMY_TRAINER_TASKS = [
  { id: "dummy-task-1", title: "Build responsive landing page", description: "Create a responsive React landing page based on the provided requirements.", dueDate: "2026-09-10", status: "PENDING", student: DUMMY_TRAINER_STUDENTS[0].student },
  { id: "dummy-task-2", title: "API integration practice", description: "Connect the frontend form to a REST API and handle loading and error states.", dueDate: "2026-09-12", status: "SUBMITTED", student: DUMMY_TRAINER_STUDENTS[1].student },
  { id: "dummy-task-3", title: "Code review exercise", description: "Review the assigned component and document improvement suggestions.", dueDate: "2026-09-08", status: "COMPLETED", student: DUMMY_TRAINER_STUDENTS[2].student },
  { id: "dummy-task-4", title: "Testing checklist", description: "Write a basic checklist for functional and UI testing.", dueDate: "2026-09-15", status: "PENDING", student: DUMMY_TRAINER_STUDENTS[3].student },
];

export const DUMMY_TRAINER_DASHBOARD = {
  company: { name: "Atlas Technologies" },
  stats: {
    totalStudents: DUMMY_TRAINER_STUDENTS.length,
    pendingApplications: DUMMY_TRAINER_APPLICATIONS.length,
    activeTasks: 3,
    completedTasks: 1,
  },
};
