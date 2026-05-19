"use client";

import { useState } from "react";

type CourseTabsLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  isFreePreview: boolean;
};

type CourseTabsSection = {
  id: string;
  title: string;
  lessons: CourseTabsLesson[];
};

type CourseTabsProps = {
  description: string;
  learningOutcomes: string[];
  targetStudents: string[];
  sections: CourseTabsSection[];
  sectionsCount: number;
  lessonsCount: number;
};

type TabKey = "overview" | "outcomes" | "audience" | "curriculum";

const tabs: { key: TabKey; label: string }[] = [
  {
    key: "curriculum",
    label: "محتوى الكورس",
  },
  {
    key: "outcomes",
    label: "ماذا ستتعلم؟",
  },
  {
    key: "audience",
    label: "لمن هذا الكورس؟",
  },
  {
    key: "overview",
    label: "نظرة عامة",
  },
];

export function CourseTabs({
  description,
  learningOutcomes,
  targetStudents,
  sections,
  sectionsCount,
  lessonsCount,
}: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("curriculum");

  return (
    <div className="mt-8">
      <div className="sticky top-[86px] z-20 -mx-6 border-y border-[var(--border-soft)] bg-white/95 px-6 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={
                  isActive
                    ? "shrink-0 rounded-xl bg-[var(--brand-700)] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm"
                    : "shrink-0 rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-extrabold text-[var(--brand-900)] transition hover:border-[var(--brand-400)] hover:text-[var(--brand-700)]"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-7">
        {activeTab === "overview" ? (
          <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-[var(--brand-900)]">
              عن الكورس
            </h2>

            <p className="mt-4 leading-9 text-[var(--text-muted)]">
              {description}
            </p>
          </section>
        ) : null}

        {activeTab === "outcomes" ? (
          <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-[var(--brand-900)]">
              ماذا ستتعلم؟
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {learningOutcomes.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                >
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-50)] text-sm font-extrabold text-[var(--brand-700)]">
                    ✓
                  </span>

                  <p className="text-sm font-bold leading-7 text-[var(--text-muted)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "audience" ? (
          <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-extrabold text-[var(--brand-900)]">
              لمن هذا الكورس؟
            </h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {targetStudents.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4"
                >
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-extrabold text-[var(--accent-600)]">
                    •
                  </span>

                  <p className="text-sm font-bold leading-7 text-[var(--text-muted)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "curriculum" ? (
          <section className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="font-bold text-[var(--brand-500)]">
                  محتوى الكورس
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[var(--brand-900)]">
                  الدروس والأقسام
                </h2>
              </div>

              <span className="rounded-full bg-[var(--brand-50)] px-4 py-2 text-xs font-extrabold text-[var(--brand-700)]">
                {sectionsCount} أقسام • {lessonsCount} دروس
              </span>
            </div>

            <div className="space-y-4">
              {sections.length === 0 ? (
                <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-6 text-center text-sm font-bold text-[var(--text-muted)]">
                  لا توجد دروس منشورة لهذا الكورس حتى الآن.
                </div>
              ) : (
                sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-extrabold text-[var(--brand-900)]">
                        {sectionIndex + 1}. {section.title}
                      </h3>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--text-muted)]">
                        {section.lessons.length} درس
                      </span>
                    </div>

                    <div className="space-y-3">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3"
                        >
                          <div>
                            <p className="font-bold">
                              {lessonIndex + 1}. {lesson.title}
                            </p>

                            {lesson.isFreePreview ? (
                              <p className="mt-1 text-xs font-extrabold text-[var(--accent-500)]">
                                درس مجاني للمعاينة
                              </p>
                            ) : null}
                          </div>

                          <span className="shrink-0 text-xs font-bold text-[var(--text-muted)]">
                            {lesson.durationMinutes} دقيقة
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}