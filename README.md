# 👨‍💼 HR Management System IMOSTI INC 2026

## 📌 Overview

This guide is for the **Super Admin** of the HR Management System. It explains how to manage employees, trainings, records, attendance, reports, and system settings.

---

# 🔐 1. Login

## ➤ Run Development Server

```bash
npm run dev
```

1. Open the system URL:

```bash
http://localhost:5173
```

or deployed website:

🌐 https://hrimosti.web.app/

2. Enter your ** email and password**
3. Click **Login**
4. You will be redirected to the **Dashboard**

---

# 🏗️ 2. Build Project

## ➤ Production Build

```bash
npm run build
```

Used for releasing and building the production files.

---

# 🚀 3. Deploy to Firebase

## ➤ Publish Website

```bash
firebase deploy
```

Live Website:

🌐 https://hrimosti.web.app/

---

# 📊 4. Dashboard Overview

The dashboard shows:

- Total Employees
- Total Trainings
- Activity Logs
- Employee Statistics
- Recent Activities

👉 Use this page to monitor overall HR system activity.

---

# 👥 5. Manage Employees

## ➤ View Employees

1. Go to **Employees**
2. View all registered employees

---

## ➤ Add Employee

1. Click **Add Employee**
2. Fill in employee details:

   - Full Name
   - Position
   - Department
   - Contact Information
   - Employment Status

3. Click **Save**

---

## ➤ Edit Employee

1. Click **Edit** beside employee
2. Update employee information
3. Click **Update**

---

## ➤ Delete Employee

1. Click **Delete**
2. Confirm action

⚠️ Deleted employee records may not be recoverable.

---

# 🎓 6. Manage Trainings

## ➤ View Trainings

1. Go to **Trainings**
2. View employee training records

---

## ➤ Add Training Record

1. Click **Add Training**
2. Enter:

   - Training Title
   - Employee Name
   - Date
   - Certificate Details

3. Save record

---

## ➤ Edit Training

1. Select training record
2. Click **Edit**
3. Update information
4. Save changes

---

## ➤ Delete Training

1. Click **Delete**
2. Confirm deletion

---

# 🕒 7. Attendance Monitoring

## ➤ View Attendance

1. Go to **Attendance**
2. Monitor employee attendance records

---

## ➤ Update Attendance

1. Select employee attendance
2. Modify:

   - Time In
   - Time Out
   - Attendance Status

3. Save changes

---

# 📄 8. Reports & PDF Generation

1. Go to **Reports**
2. Generate:

   - Employee Reports
   - Training Reports
   - Attendance Reports

3. Export as:

   - PDF
   - CSV

---

# ⚙️ 9. System Settings

1. Go to **Settings**
2. Configure:

   - System Name
   - Firebase Configuration
   - User Access
   - Admin Accounts

3. Save changes

---

# 🔒 10. Security & Access Control

- Super Admin has full system access
- Assign roles carefully:

  - Super Admin
  - Admin
  - HR Staff

- Always logout after use
- Protect Firebase credentials

---

# 📝 11. Activity Logs

1. Open **Activity Logs**
2. Monitor user actions such as:

   - Employee updates
   - Login activity
   - Record modifications

---

# 🚪 12. Logout

1. Click profile icon
2. Click **Logout**

---

# ⚠️ Important Notes

- Always backup Firebase database regularly
- Avoid deleting important employee records
- Double-check reports before exporting
- Keep admin credentials secure

---

# 🛠️ Troubleshooting

## ➤ Cannot Login?

- Check email and password
- Reset password if needed
- Verify Firebase Authentication

---

## ➤ Data Not Loading?

- Refresh the page
- Check internet connection
- Verify Firestore database rules

---

## ➤ Firebase Deployment Error?

Run:

```bash
firebase login
firebase deploy
```

---

# 💻 Technologies Used

- React JS
- Vite
- Firebase
- Firestore Database
- JavaScript
- CSS

---

# 👨‍💻 Developer Information

This system was developed by:

**IMOSTI INC**

For technical issues, contact the system developer/admin.

---

✅ End of Super Admin Manual
