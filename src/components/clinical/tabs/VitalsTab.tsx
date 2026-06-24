import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { type Resident, type ResidentClinicalData, type VitalRecord } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
  onAddVital: (v: VitalRecord) => void;
}

const PAIN_LABELS = ["0-No pain", "1-2 Minimal", "3-4 Mild", "5-6 Moderate", "7-8 Severe", "9-10 Worst"];

export function VitalsTab({ data, onAddVital }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bpSys: "", bpDia: "", pulse: "", temp: "", o2Sat: "", weight: "", pain: "0",
  });

  function handleSave() {
    const now = new Date();
    const newRecord: VitalRecord = {
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      bpSystolic: Number(form.bpSys),
      bpDiastolic: Number(form.bpDia),
      pulse: Number(form.pulse),
      temp: Number(form.temp),
      o2Sat: Number(form.o2Sat),
      weightLbs: Number(form.weight),
      painLevel: Number(form.pain),
      recordedBy: "Current User, RN",
    };
    onAddVital(newRecord);
    setForm({ bpSys: "", bpDia: "", pulse: "", temp: "", o2Sat: "", weight: "", pain: "0" });
    setShowForm(false);
  }

  const isFormValid = form.bpSys && form.bpDia && form.pulse && form.temp && form.o2Sat && form.weight;

  const vitals = [...data.vitals].sort((a, b) => a.date.localeCompare(b.date));
  const latest = vitals.at(-1);

  const chartData = vitals.map((v) => ({
    date: v.date.slice(5).replace("-", "/"),
    sys: v.bpSystolic,
    dia: v.bpDiastolic,
    pulse: v.pulse,
  }));

  return (
    <div className="space-y-5">
      {/* Record vitals form */}
      {showForm && (
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Record Vitals</p>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Blood Pressure (mmHg)</label>
              <div className="flex items-center gap-1.5">
                <input
                  value={form.bpSys}
                  onChange={(e) => setForm((f) => ({ ...f, bpSys: e.target.value }))}
                  placeholder="Sys"
                  type="number"
                  className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-muted-foreground">/</span>
                <input
                  value={form.bpDia}
                  onChange={(e) => setForm((f) => ({ ...f, bpDia: e.target.value }))}
                  placeholder="Dia"
                  type="number"
                  className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            {[
              { key: "pulse" as const, label: "Pulse (bpm)", placeholder: "72" },
              { key: "temp" as const, label: "Temp (°F)", placeholder: "98.6" },
              { key: "o2Sat" as const, label: "O₂ Sat (%)", placeholder: "98" },
              { key: "weight" as const, label: "Weight (lbs)", placeholder: "145" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  type="number"
                  step="0.1"
                  className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Pain (NRS 0–10)</label>
              <select
                value={form.pain}
                onChange={(e) => setForm((f) => ({ ...f, pain: e.target.value }))}
                className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Array.from({ length: 11 }, (_, i) => (
                  <option key={i} value={i}>{i}{i === 0 ? " — No pain" : i >= 7 ? " — Severe" : i >= 4 ? " — Moderate" : ""}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className="px-3 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40"
            >
              Save Vitals
            </button>
          </div>
        </div>
      )}

      {/* Latest vitals summary */}
      {latest && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Latest — {latest.date} at {latest.time} · {latest.recordedBy}
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
              >
                <Plus size={13} />
                Record Vitals
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <VitalCard
              label="Blood Pressure"
              value={`${latest.bpSystolic}/${latest.bpDiastolic}`}
              unit="mmHg"
              alert={latest.bpSystolic > 160 || latest.bpSystolic < 90 || latest.bpDiastolic > 100}
            />
            <VitalCard
              label="Pulse"
              value={`${latest.pulse}`}
              unit="bpm"
              alert={latest.pulse > 100 || latest.pulse < 50}
            />
            <VitalCard
              label="Temperature"
              value={`${latest.temp}`}
              unit="°F"
              alert={latest.temp > 99.5 || latest.temp < 96}
            />
            <VitalCard
              label="O₂ Saturation"
              value={`${latest.o2Sat}%`}
              unit=""
              alert={latest.o2Sat < 92}
            />
            <VitalCard label="Weight" value={`${latest.weightLbs}`} unit="lbs" />
            <VitalCard
              label="Pain (NRS)"
              value={`${latest.painLevel}/10`}
              unit=""
              alert={latest.painLevel >= 7}
              warn={latest.painLevel >= 4 && latest.painLevel < 7}
            />
          </div>
        </div>
      )}

      {!latest && !showForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
          >
            <Plus size={13} />
            Record Vitals
          </button>
        </div>
      )}

      {/* BP trend chart */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Blood Pressure Trend — 14 Days
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="hsl(0 0% 100% / 0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[50, 190]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <ReferenceLine y={140} stroke="var(--destructive)" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={90} stroke="var(--warning)" strokeDasharray="3 3" strokeOpacity={0.4} />
            <Line
              dataKey="sys"
              name="Systolic"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              dataKey="dia"
              name="Diastolic"
              stroke="var(--accent)"
              strokeWidth={1.5}
              dot={false}
              strokeOpacity={0.75}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-5 mt-2">
          <LegendItem color="var(--primary)" label="Systolic" />
          <LegendItem color="var(--accent)" label="Diastolic" />
          <span className="text-[11px] text-muted-foreground">— dashed: 140 / 90 thresholds</span>
        </div>
      </div>

      {/* History table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Full Vitals History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                {["Date", "Time", "BP (mmHg)", "Pulse", "Temp °F", "O₂ Sat", "Weight lbs", "Pain", "Recorded By"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[...vitals].reverse().map((v) => (
                <tr
                  key={`${v.date}-${v.time}`}
                  className="border-b border-border last:border-0 hover:bg-surface/30 transition-colors"
                >
                  <td className="px-3 py-2 font-mono whitespace-nowrap">{v.date}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{v.time}</td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono font-medium whitespace-nowrap",
                      v.bpSystolic > 160 || v.bpSystolic < 90 ? "text-destructive" : "",
                    )}
                  >
                    {v.bpSystolic}/{v.bpDiastolic}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono whitespace-nowrap",
                      v.pulse > 100 || v.pulse < 50 ? "text-destructive" : "",
                    )}
                  >
                    {v.pulse}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono whitespace-nowrap",
                      v.temp > 99.5 || v.temp < 96 ? "text-destructive" : "",
                    )}
                  >
                    {v.temp}
                  </td>
                  <td
                    className={cn("px-3 py-2 font-mono whitespace-nowrap", v.o2Sat < 92 ? "text-destructive" : "")}
                  >
                    {v.o2Sat}%
                  </td>
                  <td className="px-3 py-2 font-mono whitespace-nowrap">{v.weightLbs}</td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono whitespace-nowrap",
                      v.painLevel >= 7 ? "text-destructive" : v.painLevel >= 4 ? "text-warning" : "",
                    )}
                  >
                    {v.painLevel}/10
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{v.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VitalCard({
  label, value, unit, alert, warn,
}: {
  label: string; value: string; unit: string; alert?: boolean; warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        alert ? "border-destructive/30 bg-destructive/10" : warn ? "border-warning/30 bg-warning/10" : "border-border bg-surface",
      )}
    >
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      <div
        className={cn(
          "font-mono text-lg font-bold leading-none",
          alert ? "text-destructive" : warn ? "text-warning" : "",
        )}
      >
        {value}
      </div>
      {unit && <div className="text-[10px] text-muted-foreground mt-0.5">{unit}</div>}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="w-4 h-0.5 rounded-full inline-block" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
