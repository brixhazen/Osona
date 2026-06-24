import { useState } from "react";
import { cn } from "@/lib/utils";
import { TodayService } from "./TodayService";
import { ResidentDiets } from "./ResidentDiets";
import { MenuPlanner } from "./MenuPlanner";
import { WeightMonitoring } from "./WeightMonitoring";
import { DiningReports } from "./DiningReports";
import { FoodProcurement } from "./FoodProcurement";
import {
  DINING_METRICS, WEIGHT_ALERTS, TODAYS_MEALS, RESIDENT_DIETS, PURCHASE_ORDERS, daysUntil,
  type MealService, type WeightAlert, type WeightTrend, type ResidentDietProfile,
  type PurchaseOrder, type POStatus,
} from "@/lib/mock/dining";
import { AlertTriangle, BarChart3, Calendar, Package, Scale, Utensils, UtensilsCrossed } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#FB923C";

type Tab = "today" | "diets" | "menu" | "procurement" | "weights" | "reports";

const TABS: { id: Tab; label: string }[] = [
  { id: "today",       label: "Today's Service" },
  { id: "diets",       label: "Resident Diets" },
  { id: "menu",        label: "Menu Planner" },
  { id: "procurement", label: "Procurement" },
  { id: "weights",     label: "Weight Monitoring" },
  { id: "reports",     label: "Reports" },
];

const MOCK_DINNER_COUNT = 12;

export function DiningModule() {
  const [tab, setTab] = useState<Tab>("today");
  const [localMeals, setLocalMeals] = useState<MealService[]>([...TODAYS_MEALS]);
  const [localWeightAlerts, setLocalWeightAlerts] = useState<WeightAlert[]>(
    WEIGHT_ALERTS.map((a) => ({ ...a, history: [...a.history] })),
  );
  const [localDiets, setLocalDiets] = useState<ResidentDietProfile[]>(
    RESIDENT_DIETS.map((r) => ({ ...r, weightHistory: [...r.weightHistory], alerts: [...r.alerts] })),
  );
  const [localPOs, setLocalPOs] = useState<PurchaseOrder[]>(
    PURCHASE_ORDERS.map((po) => ({ ...po, lineItems: po.lineItems.map((li) => ({ ...li })) })),
  );

  function receiveLineItem(poId: string, itemId: string) {
    setLocalPOs((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        const newItems = po.lineItems.map((li) =>
          li.id === itemId ? { ...li, qtyReceived: li.qtyOrdered } : li,
        );
        const allReceived = newItems
          .filter((li) => li.qtyOrdered > 0)
          .every((li) => li.qtyReceived >= li.qtyOrdered);
        const anyReceived = newItems.some((li) => li.qtyReceived > 0);
        const newStatus: POStatus = allReceived ? "delivered" : anyReceived ? "partial" : po.status;
        return {
          ...po,
          lineItems: newItems,
          status: newStatus,
          actualDelivery: allReceived ? new Date().toISOString().slice(0, 10) : po.actualDelivery,
        };
      }),
    );
  }

  function receiveAllItems(poId: string) {
    setLocalPOs((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        return {
          ...po,
          lineItems: po.lineItems.map((li) => ({
            ...li,
            qtyReceived: Math.max(li.qtyReceived, li.qtyOrdered),
          })),
          status: "delivered" as const,
          actualDelivery: new Date().toISOString().slice(0, 10),
        };
      }),
    );
  }

  function submitDinnerAttendance(markedCount: number) {
    const dinner = localMeals.find((m) => m.period === "dinner");
    const census = dinner?.totalCensus ?? 87;
    const attended = Math.round((markedCount / MOCK_DINNER_COUNT) * census);
    setLocalMeals((prev) =>
      prev.map((m) =>
        m.period !== "dinner" ? m : {
          ...m,
          status: "completed" as const,
          attended,
          dietBreakdown: {
            regular:         Math.round(attended * 0.51),
            low_sodium:      Math.round(attended * 0.16),
            diabetic:        Math.round(attended * 0.09),
            mechanical_soft: Math.round(attended * 0.08),
            pureed:          Math.round(attended * 0.04),
          },
        },
      ),
    );
  }

  function logWeight(residentId: string, weight: number) {
    setLocalWeightAlerts((prev) =>
      prev.map((a) => {
        if (a.residentId !== residentId) return a;
        const newHistory = [...a.history.slice(1), { month: "Jun", weight }];
        const pctChange30Day = parseFloat(
          ((weight - a.currentWeight) / a.currentWeight * 100).toFixed(1),
        );
        const pctChange90Day = parseFloat(
          ((weight - a.previousWeight) / a.previousWeight * 100).toFixed(1),
        );
        let trend: WeightTrend = "stable";
        if (pctChange30Day <= -5 || pctChange90Day <= -10) trend = "losing_critical";
        else if (pctChange30Day < -3 || pctChange90Day < -7) trend = "losing_alert";
        else if (pctChange30Day < 0 || pctChange90Day < 0) trend = "losing_minor";
        else if (pctChange30Day > 0) trend = "gaining";
        return { ...a, currentWeight: weight, history: newHistory, pctChange30Day, pctChange90Day, trend };
      }),
    );
  }

  function markAssessmentComplete(residentId: string) {
    setLocalDiets((prev) =>
      prev.map((r) => r.id === residentId ? { ...r, assessmentStatus: "current" as const } : r),
    );
  }

  function orderCalorieCount(residentId: string) {
    setLocalWeightAlerts((prev) =>
      prev.map((a) => a.residentId === residentId ? { ...a, calorieCountOrdered: true } : a),
    );
  }

  const criticalAlerts = localWeightAlerts.filter((w) => w.trend === "losing_critical").length;
  const alertCount = localWeightAlerts.filter((w) => w.trend !== "losing_minor").length;
  const criticalResident = localWeightAlerts.find((w) => w.trend === "losing_critical");

  const breakfastMeal = localMeals.find((m) => m.period === "breakfast");
  const lunchMeal = localMeals.find((m) => m.period === "lunch");
  const breakfastPct = breakfastMeal
    ? Math.round((breakfastMeal.attended / breakfastMeal.totalCensus) * 100) : 0;
  const lunchPct = lunchMeal
    ? Math.round((lunchMeal.attended / lunchMeal.totalCensus) * 100) : 0;

  const assessmentsDue = localDiets.filter((r) => r.assessmentStatus !== "current");
  const overdueResident = localDiets.find((r) => r.assessmentStatus === "overdue");
  const dietitianDays = daysUntil(DINING_METRICS.nextDietitianVisit);

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Dining & Nutrition"
        description="Menu planning, meal service, dietary restrictions, and weight monitoring."
        icon={Utensils}
        color={MODULE_COLOR}
      />

      {/* KPI bar */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard
          icon={<Utensils size={14} />}
          label="Meal Participation"
          value={`${breakfastPct}% · ${lunchPct}%`}
          sub="Breakfast · Lunch today"
          tone="ok"
        />
        <KpiCard
          icon={<UtensilsCrossed size={14} />}
          label="Special Diets"
          value={`${DINING_METRICS.specialDietCount} residents`}
          sub={`${Math.round((DINING_METRICS.specialDietCount / DINING_METRICS.totalCensus) * 100)}% of census`}
        />
        <KpiCard
          icon={<Scale size={14} />}
          label="Weight Alerts"
          value={`${alertCount} residents`}
          sub={
            criticalResident
              ? `${criticalAlerts} critical — ${criticalResident.residentName.split(" ").slice(-1)[0]}`
              : "No critical alerts"
          }
          tone={criticalAlerts > 0 ? "danger" : alertCount > 0 ? "warn" : undefined}
        />
        <KpiCard
          icon={<Calendar size={14} />}
          label="Next Dietitian Visit"
          value={DINING_METRICS.nextDietitianVisit}
          sub={dietitianDays >= 0 ? `${dietitianDays} days away` : `${Math.abs(dietitianDays)} days overdue`}
        />
        <KpiCard
          icon={<BarChart3 size={14} />}
          label="Assessments Due"
          value={`${assessmentsDue.length} residents`}
          sub={overdueResident ? `${overdueResident.name} overdue` : "None overdue"}
          tone={overdueResident ? "warn" : undefined}
        />
      </div>

      {/* Alert bar */}
      {criticalAlerts > 0 && criticalResident && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <AlertTriangle size={14} className="text-destructive shrink-0" />
          <span className="text-sm">
            <span className="text-destructive font-medium">
              {criticalResident.residentName} — {Math.abs(criticalResident.pctChange90Day).toFixed(1)}% weight loss since baseline
            </span>
            <span className="text-muted-foreground">
              {criticalResident.calorieCountOrdered ? " · Calorie count active" : ""}
              {" · Nutrition assessment overdue"}
            </span>
          </span>
          <button
            onClick={() => setTab("weights")}
            className="ml-auto text-xs text-destructive hover:text-destructive/80 font-medium"
          >
            View Weights →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-b-2"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            {t.label}
            {t.id === "weights" && alertCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-mono">
                {alertCount}
              </span>
            )}
            {t.id === "procurement" && localPOs.filter((p) => p.status === "in_transit" || p.status === "partial").length > 0 && (
              <span className="ml-1.5 text-[10px] bg-accent/10 text-accent px-1 py-0.5 rounded font-mono">
                {localPOs.filter((p) => p.status === "in_transit" || p.status === "partial").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <TodayService
          meals={localMeals}
          onSubmitDinnerAttendance={submitDinnerAttendance}
          onNavigate={setTab}
        />
      )}
      {tab === "diets"        && <ResidentDiets />}
      {tab === "menu"         && <MenuPlanner />}
      {tab === "procurement"  && (
        <FoodProcurement
          pos={localPOs}
          onReceiveLineItem={receiveLineItem}
          onReceiveAllItems={receiveAllItems}
        />
      )}
      {tab === "weights" && (
        <WeightMonitoring
          alerts={localWeightAlerts}
          diets={localDiets}
          onLogWeight={logWeight}
          onMarkAssessmentComplete={markAssessmentComplete}
          onOrderCalorieCount={orderCalorieCount}
        />
      )}
      {tab === "reports" && <DiningReports />}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, tone }: {
  icon: React.ReactNode; label: string; value: string; sub: string; tone?: "ok" | "warn" | "danger";
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      tone === "danger" ? "border-destructive/30" : tone === "warn" ? "border-accent/30" : "border-border",
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn(
        "text-lg font-semibold leading-tight",
        tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : tone === "ok" ? "text-success" : "text-foreground",
      )}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
