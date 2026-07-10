/* ============================================================
   i18n.js — English / Arabic translations + RTL switching
   ============================================================ */

const I18N = (() => {
  // Some browsers restrict localStorage under strict file:// security settings.
  // Fall back to an in-memory store so the app never crashes because of it.
  const memoryStore = {};
  const safeStorage = {
    getItem(key) {
      try { return localStorage.getItem(key); } catch { return memoryStore[key] ?? null; }
    },
    setItem(key, value) {
      try { localStorage.setItem(key, value); } catch { memoryStore[key] = value; }
    },
  };

  const dict = {
    en: {
      appName: 'Code Center',
      appSubtitle: 'Offline Manager',
      nav_dashboard: 'Dashboard',
      nav_students: 'Students',
      nav_courses: 'Courses',
      nav_schedule: 'Weekly Schedule',
      nav_attendance: 'Attendance',
      nav_payments: 'Payments',
      nav_finance: 'Finance',
      nav_reports: 'Reports',
      nav_materials: 'Course Materials',
      nav_notes: 'Notes',
      nav_tasks: 'Tasks',
      nav_settings: 'Settings',

      // Common
      add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel',
      search: 'Search', actions: 'Actions', confirm: 'Confirm', close: 'Close',
      name: 'Name', description: 'Description', price: 'Price', duration: 'Duration',
      date: 'Date', notes: 'Notes', status: 'Status', amount: 'Amount', category: 'Category',
      total: 'Total', none: 'None', all: 'All', open: 'Open', upload: 'Upload',
      confirmDeleteTitle: 'Confirm Delete', confirmDeleteMsg: 'This action cannot be undone. Continue?',
      noData: 'No data yet.', saved: 'Saved successfully', deleted: 'Deleted successfully',

      // Dashboard
      totalStudents: 'Total Students', totalCourses: 'Total Courses', todaysClasses: "Today's Classes",
      monthlyIncome: 'Monthly Income', monthlyExpenses: 'Monthly Expenses', monthlyProfit: 'Monthly Profit',
      recentActivity: 'Recent Activity', incomeVsExpense: 'Income vs Expenses (6 months)',

      // Students
      addStudent: 'Add Student', editStudent: 'Edit Student', studentPhoto: 'Photo',
      phone: 'Phone', parentPhone: 'Parent Phone', age: 'Age', course: 'Course',
      enrollmentDate: 'Enrollment Date', paymentStatus: 'Payment Status',
      paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid', searchStudents: 'Search by name, phone or course...',
      uploadPhoto: 'Upload Photo', noCourse: 'No course',

      // Courses
      addCourse: 'Add Course', editCourse: 'Edit Course', courseName: 'Course Name',
      sessions: 'Number of Sessions', courseColor: 'Course Color',

      // Schedule
      day: 'Day', startTime: 'Start Time', endTime: 'End Time', classroom: 'Classroom',
      addClass: 'Add Class', editClass: 'Edit Class', noClasses: 'No classes',
      day_saturday: 'Saturday', day_sunday: 'Sunday', day_monday: 'Monday', day_tuesday: 'Tuesday',
      day_wednesday: 'Wednesday', day_thursday: 'Thursday', day_friday: 'Friday',

      // Attendance
      markAttendance: 'Mark Attendance', history: 'History', present: 'Present', absent: 'Absent',
      attendancePercentage: 'Attendance %', student: 'Student',

      // Payments
      recordPayment: 'Record Payment', remainingBalance: 'Remaining Balance',
      paymentHistory: 'Payment History', method: 'Method', coursePrice: 'Course Price',
      cash: 'Cash', card: 'Card', transfer: 'Bank Transfer', other: 'Other',

      // Finance
      addIncome: 'Add Income', addExpense: 'Add Expense', totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses', netProfit: 'Net Profit', expensesByCategory: 'Expenses by Category',
      income: 'Income', expense: 'Expense',
      cat_rent: 'Rent', cat_salaries: 'Salaries', cat_equipment: 'Equipment', cat_utilities: 'Utilities',
      cat_marketing: 'Marketing', cat_supplies: 'Supplies', cat_other: 'Other',

      // Reports
      daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly',
      exportPdf: 'Export PDF', exportExcel: 'Export Excel', reportPeriod: 'Period',
      printHint: 'Use "Save as PDF" in the print dialog to export.',

      // Materials
      courseMaterials: 'Course Materials', uploadFile: 'Upload File', filterByCourse: 'Filter by Course',
      uncategorized: 'Uncategorized',

      // Notes
      dailyNotes: 'Daily Notes', studentNotes: 'Student Notes', generalReminders: 'General Reminders',
      title: 'Title', content: 'Content', addNote: 'Add Note', editNote: 'Edit Note',

      // Tasks
      addTask: 'Add Task', editTask: 'Edit Task', dueDate: 'Due Date', priority: 'Priority',
      low: 'Low', medium: 'Medium', high: 'High', pending: 'Pending', completed: 'Completed',

      // Settings
      appearance: 'Appearance', lightMode: 'Light Mode', darkMode: 'Dark Mode',
      language: 'Language', backupData: 'Backup Data', restoreData: 'Restore Data',
      backupDesc: 'Save all your data to a JSON file you can keep anywhere as a backup.',
      restoreDesc: 'Restore your data from a previously saved JSON backup file. This replaces all current data.',
      backupBtn: 'Download Backup (.json)', restoreBtn: 'Restore from File',
      restoreConfirm: 'This will replace ALL current data with the backup file. Continue?',
      restoreDone: 'Data restored successfully. Reloading...',
      storageInfo: 'This app runs 100% offline in your browser. All data is stored locally using IndexedDB — nothing is sent anywhere.',
    },
    ar: {
      appName: 'مركز التدريب',
      appSubtitle: 'إدارة غير متصلة',
      nav_dashboard: 'لوحة التحكم',
      nav_students: 'الطلاب',
      nav_courses: 'الدورات',
      nav_schedule: 'الجدول الأسبوعي',
      nav_attendance: 'الحضور',
      nav_payments: 'المدفوعات',
      nav_finance: 'المالية',
      nav_reports: 'التقارير',
      nav_materials: 'مواد الدورة',
      nav_notes: 'الملاحظات',
      nav_tasks: 'المهام',
      nav_settings: 'الإعدادات',

      add: 'إضافة', edit: 'تعديل', delete: 'حذف', save: 'حفظ', cancel: 'إلغاء',
      search: 'بحث', actions: 'إجراءات', confirm: 'تأكيد', close: 'إغلاق',
      name: 'الاسم', description: 'الوصف', price: 'السعر', duration: 'المدة',
      date: 'التاريخ', notes: 'ملاحظات', status: 'الحالة', amount: 'المبلغ', category: 'الفئة',
      total: 'الإجمالي', none: 'بدون', all: 'الكل', open: 'فتح', upload: 'رفع',
      confirmDeleteTitle: 'تأكيد الحذف', confirmDeleteMsg: 'لا يمكن التراجع عن هذا الإجراء. هل تريد المتابعة؟',
      noData: 'لا توجد بيانات بعد.', saved: 'تم الحفظ بنجاح', deleted: 'تم الحذف بنجاح',

      totalStudents: 'إجمالي الطلاب', totalCourses: 'إجمالي الدورات', todaysClasses: 'حصص اليوم',
      monthlyIncome: 'الدخل الشهري', monthlyExpenses: 'المصروفات الشهرية', monthlyProfit: 'الربح الشهري',
      recentActivity: 'النشاط الأخير', incomeVsExpense: 'الدخل مقابل المصروفات (٦ أشهر)',

      addStudent: 'إضافة طالب', editStudent: 'تعديل طالب', studentPhoto: 'الصورة',
      phone: 'الهاتف', parentPhone: 'هاتف ولي الأمر', age: 'العمر', course: 'الدورة',
      enrollmentDate: 'تاريخ التسجيل', paymentStatus: 'حالة الدفع',
      paid: 'مدفوع', partial: 'جزئي', unpaid: 'غير مدفوع', searchStudents: 'بحث بالاسم أو الهاتف أو الدورة...',
      uploadPhoto: 'رفع صورة', noCourse: 'بدون دورة',

      addCourse: 'إضافة دورة', editCourse: 'تعديل دورة', courseName: 'اسم الدورة',
      sessions: 'عدد الجلسات', courseColor: 'لون الدورة',

      day: 'اليوم', startTime: 'وقت البدء', endTime: 'وقت الانتهاء', classroom: 'القاعة',
      addClass: 'إضافة حصة', editClass: 'تعديل حصة', noClasses: 'لا توجد حصص',
      day_saturday: 'السبت', day_sunday: 'الأحد', day_monday: 'الاثنين', day_tuesday: 'الثلاثاء',
      day_wednesday: 'الأربعاء', day_thursday: 'الخميس', day_friday: 'الجمعة',

      markAttendance: 'تسجيل الحضور', history: 'السجل', present: 'حاضر', absent: 'غائب',
      attendancePercentage: 'نسبة الحضور', student: 'الطالب',

      recordPayment: 'تسجيل دفعة', remainingBalance: 'الرصيد المتبقي',
      paymentHistory: 'سجل المدفوعات', method: 'طريقة الدفع', coursePrice: 'سعر الدورة',
      cash: 'نقدي', card: 'بطاقة', transfer: 'تحويل بنكي', other: 'أخرى',

      addIncome: 'إضافة دخل', addExpense: 'إضافة مصروف', totalIncome: 'إجمالي الدخل',
      totalExpenses: 'إجمالي المصروفات', netProfit: 'صافي الربح', expensesByCategory: 'المصروفات حسب الفئة',
      income: 'دخل', expense: 'مصروف',
      cat_rent: 'إيجار', cat_salaries: 'رواتب', cat_equipment: 'معدات', cat_utilities: 'فواتير',
      cat_marketing: 'تسويق', cat_supplies: 'مستلزمات', cat_other: 'أخرى',

      daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', yearly: 'سنوي',
      exportPdf: 'تصدير PDF', exportExcel: 'تصدير Excel', reportPeriod: 'الفترة',
      printHint: 'استخدم "حفظ كـ PDF" في نافذة الطباعة للتصدير.',

      courseMaterials: 'مواد الدورة', uploadFile: 'رفع ملف', filterByCourse: 'تصفية حسب الدورة',
      uncategorized: 'غير مصنف',

      dailyNotes: 'ملاحظات يومية', studentNotes: 'ملاحظات الطلاب', generalReminders: 'تذكيرات عامة',
      title: 'العنوان', content: 'المحتوى', addNote: 'إضافة ملاحظة', editNote: 'تعديل ملاحظة',

      addTask: 'إضافة مهمة', editTask: 'تعديل مهمة', dueDate: 'تاريخ الاستحقاق', priority: 'الأولوية',
      low: 'منخفضة', medium: 'متوسطة', high: 'عالية', pending: 'قيد الانتظار', completed: 'مكتملة',

      appearance: 'المظهر', lightMode: 'الوضع الفاتح', darkMode: 'الوضع الداكن',
      language: 'اللغة', backupData: 'نسخ احتياطي للبيانات', restoreData: 'استعادة البيانات',
      backupDesc: 'احفظ جميع بياناتك في ملف JSON يمكنك الاحتفاظ به كنسخة احتياطية.',
      restoreDesc: 'استعادة بياناتك من ملف نسخة احتياطية محفوظ مسبقًا. سيتم استبدال جميع البيانات الحالية.',
      backupBtn: 'تحميل نسخة احتياطية (.json)', restoreBtn: 'استعادة من ملف',
      restoreConfirm: 'سيؤدي هذا إلى استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل تريد المتابعة؟',
      restoreDone: 'تمت استعادة البيانات بنجاح. جارٍ إعادة التحميل...',
      storageInfo: 'يعمل هذا التطبيق بشكل غير متصل بالكامل في متصفحك. يتم تخزين جميع البيانات محليًا باستخدام IndexedDB — لا يتم إرسال أي شيء إلى أي مكان.',
    },
  };

  let currentLang = safeStorage.getItem('tc_lang') || 'en';

  function t(key) {
    return (dict[currentLang] && dict[currentLang][key]) || (dict.en[key]) || key;
  }

  function setLang(lang) {
    currentLang = lang;
    safeStorage.setItem('tc_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    applyStaticTranslations();
  }

  function getLang() {
    return currentLang;
  }

  function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key));
    });
  }

  return { t, setLang, getLang, applyStaticTranslations };
})();
