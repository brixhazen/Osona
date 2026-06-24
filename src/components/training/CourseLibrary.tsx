import { useState } from "react";
import {
  COURSES, COURSE_CATEGORY_CONFIG, DEPT_CONFIG,
  type StaffMember, type CourseCategory, type Department,
} from "@/lib/mock/training";
import { cn } from "@/lib/utils";
import { BookOpen, CheckCircle, Clock, Shield, Users } from "lucide-react";

type CategoryFilter = "all" | CourseCategory;
type DeptFilter = "all" | Department;

interface Props {
  staff: StaffMember[];
}

export function CourseLibrary({ staff }: Props) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [dept, setDept] = useState<DeptFilter>("all");

  const visible = COURSES.filter((c) => {
    if (category !== "all" && c.category !== category) return false;
    if (dept !== "all" && !c.applicableDepts.includes(dept)) return false;
    return true;
  });

  const grouped = (["mandatory", "clinical", "safety", "dietary", "hr", "leadership"] as CourseCategory[]).map((cat) => ({
    cat,
    courses: visible.filter((c) => c.category === cat),
  })).filter((g) => g.courses.length > 0);

  return (
    <div className="flex gap-5 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "mandatory", "clinical", "safety", "dietary", "hr", "leadership"] as CategoryFilter[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "all" ? "All Courses" : COURSE_CATEGORY_CONFIG[c].label}
                <span className="ml-1.5 font-mono opacity-60">
                  {c === "all" ? COURSES.length : COURSES.filter((co) => co.category === c).length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "nursing", "dietary", "activities", "maintenance", "administration"] as DeptFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                  dept === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {d === "all" ? "All Depts" : DEPT_CONFIG[d].label}
              </button>
            ))}
          </div>
        </div>

        {grouped.map(({ cat, courses }) => {
          const cfg = COURSE_CATEGORY_CONFIG[cat];
          return (
            <div key={cat} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-1">
                <BookOpen size={10} className="text-muted-foreground" />
                <span className="text-muted-foreground">{cfg.label}</span>
                <span className="text-muted-foreground opacity-60">({courses.length})</span>
              </div>
              {courses.map((course) => {
                const applicableStaff = staff.filter((s) => s.courses.some((cp) => cp.courseId === course.id));
                const completedStaff = applicableStaff.filter((s) => s.courses.find((cp) => cp.courseId === course.id)?.status === "completed");
                const overdueStaff = applicableStaff.filter((s) => s.courses.find((cp) => cp.courseId === course.id)?.status === "overdue");

                return (
                  <div key={course.id} className="rounded-lg border border-border bg-card p-4 flex items-start gap-3">
                    <div className={cn("size-8 rounded-md flex items-center justify-center shrink-0", cfg.color.replace("text-", "bg-").replace(/bg-([^/]+)\/\d+/, "bg-$1/10"))}>
                      <BookOpen size={13} className={cfg.color.split(" ").find((c) => c.startsWith("text-")) ?? "text-muted-foreground"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{course.title}</span>
                        {course.mandatory && (
                          <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border border-destructive/25 bg-destructive/8 text-destructive font-medium">
                            <Shield size={8} />
                            Required
                          </span>
                        )}
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium ml-auto", cfg.color)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock size={9} />
                          {course.durationHours}h
                        </span>
                        {applicableStaff.length > 0 && (
                          <>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users size={9} />
                              {applicableStaff.length} staff required
                            </span>
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle size={9} />
                              {completedStaff.length} completed
                            </span>
                            {overdueStaff.length > 0 && (
                              <span className="text-destructive font-medium">{overdueStaff.length} overdue</span>
                            )}
                          </>
                        )}
                        <div className="flex flex-wrap gap-1 ml-auto">
                          {course.applicableDepts.map((d) => (
                            <span key={d} className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", DEPT_CONFIG[d].color)}>
                              {DEPT_CONFIG[d].label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="w-[220px] shrink-0 flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Library Overview</div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Total Courses", value: COURSES.length,                                           cls: "text-foreground" },
              { label: "Mandatory",     value: COURSES.filter((c) => c.mandatory).length,                cls: "text-destructive" },
              { label: "Clinical",      value: COURSES.filter((c) => c.category === "clinical").length,  cls: "text-primary" },
              { label: "Role-Specific", value: COURSES.filter((c) => c.applicableDepts.length < 5).length, cls: "text-accent" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-mono font-semibold", row.cls)}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">By Category</div>
          <div className="flex flex-col gap-2">
            {(["mandatory", "clinical", "safety", "dietary", "hr", "leadership"] as CourseCategory[]).map((cat) => {
              const count = COURSES.filter((c) => c.category === cat).length;
              const cfg = COURSE_CATEGORY_CONFIG[cat];
              return (
                <div key={cat} className="flex items-center gap-2 text-[10px]">
                  <span className={cn("w-16 shrink-0", cfg.color.split(" ").find((c) => c.startsWith("text-")) ?? "")}>{cfg.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-current opacity-50"
                      style={{ width: `${(count / COURSES.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono w-3 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[10px]">
          <div className="text-primary font-semibold mb-1">Annual Reset</div>
          <p className="text-muted-foreground leading-relaxed">
            All mandatory courses reset January 1. Staff must complete required annual training by December 31.
          </p>
        </div>
      </div>
    </div>
  );
}
