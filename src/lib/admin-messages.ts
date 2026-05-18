const messages: Record<string, string> = {
  // Courses
  "course-created": "تم إضافة الكورس بنجاح.",
  "course-updated": "تم حفظ تعديلات الكورس بنجاح.",
  "course-published": "تم نشر الكورس وإظهاره للطلاب.",
  "course-hidden": "تم إخفاء الكورس من الواجهة العامة.",
  "course-archived": "تم أرشفة الكورس وإخفاؤه من الواجهة العامة.",
  "course-unarchived": "تمت استعادة الكورس من الأرشيف وأصبح مسودة مخفية.",
  "course-deleted": "تم حذف الكورس نهائيًا.",
  "use-delete-button": "استخدم زر الحذف من لوحة الإدارة.",
  "use-archive-button": "استخدم زر الأرشفة من لوحة الإدارة.",
  "use-unarchive-button": "استخدم زر استعادة الكورس من لوحة الإدارة.",

  // Sections
  "section-created": "تم إضافة القسم بنجاح.",
  "section-deleted": "تم حذف القسم بنجاح.",
  "section-title-required": "عنوان القسم مطلوب.",

  // Lessons
  "lesson-created": "تم إضافة الدرس بنجاح.",
  "lesson-updated": "تم حفظ تعديلات الدرس بنجاح.",
  "lesson-deleted": "تم حذف الدرس بنجاح.",
  "lesson-title-required": "عنوان الدرس مطلوب.",
  "title-required": "عنوان الدرس مطلوب.",

  // Lesson resources
  "resource-created": "تم إضافة مرفق الدرس بنجاح.",
  "resource-deleted": "تم حذف مرفق الدرس بنجاح.",

  // Orders
  "confirmed": "تم تأكيد الطلب وفتح الكورس للطالب.",
  "rejected": "تم رفض الطلب.",
  "not-found": "العنصر المطلوب غير موجود.",

  // Settings
  "saved": "تم حفظ الإعدادات بنجاح.",
  "settings-updated": "تم حفظ إعدادات المنصة بنجاح.",

  // Security
  "password-updated": "تم تغيير كلمة المرور بنجاح.",

  // Users
  "user-disabled": "تم إيقاف الحساب بنجاح.",
  "user-enabled": "تم تفعيل الحساب بنجاح.",
  "course-granted": "تم فتح الكورس للطالب بنجاح.",
  "course-revoked": "تم إلغاء فتح الكورس من الطالب.",
};

const errors: Record<string, string> = {
  // General
  "missing-fields": "من فضلك أكمل جميع الحقول المطلوبة.",
  "not-found": "العنصر المطلوب غير موجود.",

  // Courses
  "course-not-found": "الكورس غير موجود.",
  "missing-required-fields": "من فضلك أكمل عنوان ووصف الكورس.",
  "invalid-slug": "رابط الكورس غير صالح.",
  "slug-exists": "رابط الكورس مستخدم من قبل.",
  "course-has-data":
    "لا يمكن حذف هذا الكورس نهائيًا لأنه يحتوي على طلبات أو طلاب مسجلين. يمكنك أرشفته بدلًا من الحذف.",
  "delete-failed": "حدث خطأ أثناء الحذف.",
  "archive-failed": "حدث خطأ أثناء أرشفة الكورس.",
  "unarchive-failed": "حدث خطأ أثناء استعادة الكورس من الأرشيف.",

  // Lessons/resources
  "invalid-resource": "بيانات المرفق غير صحيحة. تأكد من العنوان والرابط.",
  "lesson-not-found": "الدرس غير موجود.",
  "enrollment-not-found": "التسجيل غير موجود.",

  // Orders
  "order-not-found": "الطلب غير موجود.",

  // Security
  "wrong-current-password": "كلمة المرور الحالية غير صحيحة.",
  "password-too-short": "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف.",
  "password-mismatch": "كلمة المرور الجديدة وتأكيدها غير متطابقين.",

  // Users
  "cannot-toggle-self": "لا يمكنك إيقاف حسابك الحالي.",
  "invalid-user": "المستخدم غير صالح لهذه العملية.",
  "invalid-course": "الكورس غير صالح أو غير منشور.",
  "missing-course": "من فضلك اختر كورسًا.",
};

export function getAdminMessage(message?: string | null) {
  if (!message) {
    return null;
  }

  return messages[message] ?? message;
}

export function getAdminError(error?: string | null) {
  if (!error) {
    return null;
  }

  return errors[error] ?? error;
}