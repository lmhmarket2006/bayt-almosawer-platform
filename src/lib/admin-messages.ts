const messages: Record<string, string> = {
  updated: "تم الحفظ بنجاح.",
  created: "تم الإنشاء بنجاح.",
  deleted: "تم الحذف بنجاح.",

  "course-created": "تم إضافة الكورس بنجاح.",
  "course-updated": "تم حفظ تعديلات الكورس بنجاح.",
  "course-deleted": "تم حذف الكورس نهائيًا بنجاح.",
  "course-archived": "تم أرشفة الكورس بنجاح.",
  "course-unarchived": "تم استعادة الكورس من الأرشيف بنجاح.",
  "course-published": "تم نشر الكورس بنجاح.",
  "course-hidden": "تم إخفاء الكورس بنجاح.",

  "section-created": "تم إضافة القسم بنجاح.",
  "section-deleted": "تم حذف القسم بنجاح.",

  "lesson-created": "تم إضافة الدرس بنجاح.",
  "lesson-updated": "تم حفظ تعديلات الدرس بنجاح.",
  "lesson-deleted": "تم حذف الدرس بنجاح.",

  "resource-created": "تم إضافة مرفق الدرس بنجاح.",
  "resource-deleted": "تم حذف مرفق الدرس بنجاح.",

  "order-confirmed": "تم تأكيد الطلب وفتح الكورس للطالب بنجاح.",
  "order-rejected": "تم رفض الطلب بنجاح.",

  "user-activated": "تم تفعيل الحساب بنجاح.",
  "user-deactivated": "تم إيقاف الحساب بنجاح.",
  "course-granted": "تم فتح الكورس للطالب بنجاح.",
  "course-revoked": "تم إلغاء فتح الكورس من الطالب بنجاح.",

  "settings-updated": "تم حفظ إعدادات المنصة بنجاح.",
  "password-updated": "تم تغيير كلمة المرور بنجاح.",

  "use-create-form": "استخدم نموذج إضافة الكورس من لوحة الإدارة.",
  "use-edit-form": "استخدم نموذج تعديل الكورس من لوحة الإدارة.",
  "use-delete-button": "استخدم زر الحذف من لوحة الإدارة.",
};

const errors: Record<string, string> = {
  error: "حدث خطأ غير متوقع. حاول مرة أخرى.",
  "missing-required-fields": "من فضلك أكمل جميع الحقول المطلوبة.",
  "not-found": "العنصر المطلوب غير موجود.",
  "invalid-data": "البيانات المدخلة غير صحيحة.",
  unauthorized: "ليس لديك صلاحية لتنفيذ هذه العملية.",

  "course-not-found": "الكورس غير موجود.",
  "course-has-data":
    "لا يمكن حذف هذا الكورس نهائيًا لأنه يحتوي على طلبات أو طلاب. استخدم الأرشفة بدل الحذف.",
  "slug-exists": "رابط الكورس مستخدم من قبل. اختر رابطًا مختلفًا.",
  "invalid-slug": "رابط الكورس غير صالح. تأكد من كتابة عنوان مناسب.",
  "invalid-price": "السعر غير صالح. تأكد أن السعر رقم صحيح ولا يكون أقل من صفر.",
  "sale-price-greater-than-price":
    "سعر الخصم لا يمكن أن يكون أكبر من السعر الأساسي.",
  "create-course-failed": "حدث خطأ أثناء إنشاء الكورس. حاول مرة أخرى.",
  "update-course-failed": "حدث خطأ أثناء حفظ تعديلات الكورس. حاول مرة أخرى.",
  "delete-course-failed": "حدث خطأ أثناء حذف الكورس. حاول مرة أخرى.",
  "archive-course-failed": "حدث خطأ أثناء أرشفة الكورس. حاول مرة أخرى.",
  "unarchive-course-failed":
    "حدث خطأ أثناء استعادة الكورس من الأرشيف. حاول مرة أخرى.",

  "section-not-found": "القسم غير موجود.",
  "delete-section-failed": "حدث خطأ أثناء حذف القسم. حاول مرة أخرى.",
  "create-section-failed": "حدث خطأ أثناء إضافة القسم. حاول مرة أخرى.",

  "lesson-not-found": "الدرس غير موجود.",
  "create-lesson-failed": "حدث خطأ أثناء إضافة الدرس. حاول مرة أخرى.",
  "update-lesson-failed": "حدث خطأ أثناء حفظ تعديلات الدرس. حاول مرة أخرى.",
  "delete-lesson-failed": "حدث خطأ أثناء حذف الدرس. حاول مرة أخرى.",

  "invalid-resource": "بيانات المرفق غير صحيحة.",
  "resource-not-found": "المرفق غير موجود.",
  "create-resource-failed": "حدث خطأ أثناء إضافة مرفق الدرس. حاول مرة أخرى.",
  "delete-resource-failed": "حدث خطأ أثناء حذف مرفق الدرس. حاول مرة أخرى.",

  "order-not-found": "الطلب غير موجود.",
  "confirm-order-failed": "حدث خطأ أثناء تأكيد الطلب. حاول مرة أخرى.",
  "reject-order-failed": "حدث خطأ أثناء رفض الطلب. حاول مرة أخرى.",

  "user-not-found": "المستخدم غير موجود.",
  "toggle-user-failed": "حدث خطأ أثناء تغيير حالة المستخدم. حاول مرة أخرى.",
  "grant-course-failed": "حدث خطأ أثناء فتح الكورس للطالب. حاول مرة أخرى.",
  "revoke-course-failed":
    "حدث خطأ أثناء إلغاء فتح الكورس من الطالب. حاول مرة أخرى.",

  "settings-update-failed": "حدث خطأ أثناء حفظ إعدادات المنصة. حاول مرة أخرى.",
  "current-password-invalid": "كلمة المرور الحالية غير صحيحة.",
  "password-mismatch": "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
  "password-too-short": "كلمة المرور يجب ألا تقل عن 8 أحرف.",
  "password-update-failed": "حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى.",
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