import { Fragment, useMemo, useState } from "react";
import { Check, X } from "lucide-react";

type Pending = {
  id: string;
  resident: string;
  room: string;
  chargeType: string;
  amount: number;
  dateOccurred: string;
  loggedBy: string;
  note?: string;
};

type Approved = {
  id: string;
  resident: string;
  chargeType: string;
  amount: number;
  dateApproved: string;
  approvedBy: string;
};

const INITIAL_PENDING: Pending[] = [
  { id: "p1", resident: "Ruth Novak",      room: "W-215",  chargeType: "Guest Meal",              amount: 18, dateOccurred: "Jun 17", loggedBy: "Maria S." },
  { id: "p2", resident: "Howard Ingram",   room: "E-220",  chargeType: "Transportation – Local",  amount: 45, dateOccurred: "Jun 16", loggedBy: "James R." },
  { id: "p3", resident: "Beverly Stone",   room: "MC-101", chargeType: "Extra Laundry Pickup",    amount: 25, dateOccurred: "Jun 17", loggedBy: "Maria S." },
  { id: "p4", resident: "Vivian Marsh",    room: "MC-108", chargeType: "Guest Meal",              amount: 18, dateOccurred: "Jun 15", loggedBy: "James R." },
  { id: "p5", resident: "Thomas Reed",     room: "A-112",  chargeType: "Guest Meal",              amount: 18, dateOccurred: "Jun 17", loggedBy: "Maria S." },
  { id: "p6", resident: "Eleanor Price",   room: "B-204",  chargeType: "Transportation – Local",  amount: 45, dateOccurred: "Jun 16", loggedBy: "James R." },
  { id: "p7", resident: "George Holt",     room: "E-118",  chargeType: "Incontinence Supplies",   amount: 32, dateOccurred: "Jun 15", loggedBy: "Maria S." },
  { id: "p8", resident: "Sandra Kim",      room: "W-310",  chargeType: "Extra Laundry Pickup",    amount: 25, dateOccurred: "Jun 17", loggedBy: "James R." },
];

const RECENTLY_APPROVED: Approved[] = [
  { id: "a1", resident: "Margaret Chen",   chargeType: "Guest Meal",              amount: 18, dateApproved: "Jun 14", approvedBy: "Lisa W." },
  { id: "a2", resident: "Frank Delgado",   chargeType: "Transportation – Local",  amount: 45, dateApproved: "Jun 13", approvedBy: "Lisa W." },
  { id: "a3", resident: "Helen Brooks",    chargeType: "Extra Laundry Pickup",    amount: 25, dateApproved: "Jun 12", approvedBy: "Lisa W." },
  { id: "a4", resident: "Walter Pierce",   chargeType: "Incontinence Supplies",   amount: 32, dateApproved: "Jun 10", approvedBy: "Daniel K." },
  { id: "a5", resident: "Joyce Hammond",   chargeType: "Guest Meal",              amount: 18, dateApproved: "Jun 8",  approvedBy: "Lisa W." },
  { id: "a6", resident: "Arthur Quinn",    chargeType: "Transportation – Local",  amount: 45, dateApproved: "Jun 6",  approvedBy: "Daniel K." },
];

const RESIDENT_DIRECTORY: { name: string; room: string }[] = [
  { name: "Ruth Novak",      room: "W-215" },
  { name: "Howard Ingram",   room: "E-220" },
  { name: "Beverly Stone",   room: "MC-101" },
  { name: "Vivian Marsh",    room: "MC-108" },
  { name: "Thomas Reed",     room: "A-112" },
  { name: "Eleanor Price",   room: "B-204" },
  { name: "George Holt",     room: "E-118" },
  { name: "Sandra Kim",      room: "W-310" },
  { name: "Margaret Chen",   room: "A-118" },
  { name: "Frank Delgado",   room: "B-210" },
  { name: "Helen Brooks",    room: "W-302" },
  { name: "Walter Pierce",   room: "E-115" },
  { name: "Joyce Hammond",   room: "A-122" },
  { name: "Arthur Quinn",    room: "B-218" },
];

const CHARGE_LIBRARY: { type: string; defaultAmount: number }[] = [
  { type: "Guest Meal",              defaultAmount: 18 },
  { type: "Transportation – Local",  defaultAmount: 45 },
  { type: "Extra Laundry Pickup",    defaultAmount: 25 },
  { type: "Incontinence Supplies",   defaultAmount: 32 },
  { type: "Salon Service",           defaultAmount: 40 },
  { type: "Pharmacy Delivery",       defaultAmount: 12 },
];

const CURRENT_USER = "Lisa W.";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function todayInput() {
  return new Date().toISOString().slice(0, 10);
}
function fmtDateInput(value: string) {
  const d = new Date(value + "T00:00:00");
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export function ApprovalsPanel() {
  const [pending, setPending] = useState<Pending[]>(INITIAL_PENDING);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    resident: RESIDENT_DIRECTORY[0].name,
    chargeType: CHARGE_LIBRARY[0].type,
    amount: String(CHARGE_LIBRARY[0].defaultAmount),
    date: todayInput(),
    note: "",
  });

  function openAdd() {
    setForm({
      resident: RESIDENT_DIRECTORY[0].name,
      chargeType: CHARGE_LIBRARY[0].type,
      amount: String(CHARGE_LIBRARY[0].defaultAmount),
      date: todayInput(),
      note: "",
    });
    setShowAdd(true);
  }

  function submitAdd() {
    const amount = parseFloat(form.amount);
    if (!form.resident || !form.chargeType || isNaN(amount) || amount <= 0) return;
    const room = RESIDENT_DIRECTORY.find((r) => r.name === form.resident)?.room ?? "—";
    const newCharge: Pending = {
      id: `p-${Date.now()}`,
      resident: form.resident,
      room,
      chargeType: form.chargeType,
      amount,
      dateOccurred: fmtDateInput(form.date),
      loggedBy: CURRENT_USER,
      note: form.note.trim() || undefined,
    };
    setPending((prev) => [newCharge, ...prev]);
    setShowAdd(false);
  }

  const total = useMemo(() => pending.reduce((s, p) => s + p.amount, 0), [pending]);

  function approve(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }
  function approveAll() {
    setPending([]);
  }
  function confirmReject(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id));
    setRejectingId(null);
    setRejectReason("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">
          {pending.length > 0 ? (
            <>
              {pending.length} charges pending · <span className="font-semibold">{usd(total)}</span> awaiting approval
            </>
          ) : (
            <span className="text-muted-foreground">No charges pending approval</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            className="rounded-md border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            + Add Charge
          </button>
          {pending.length > 0 && (
            <button
              onClick={approveAll}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#83C0DF" }}
            >
              Approve All
            </button>
          )}
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-16 text-center">
          <div className="text-sm text-muted-foreground">
            No pending approvals. All incidental charges are reviewed and up to date.
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left">Resident</th>
                <th className="px-4 py-3 text-left">Room</th>
                <th className="px-4 py-3 text-left">Charge Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Date Occurred</th>
                <th className="px-4 py-3 text-left">Logged By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((p) => (
                <Fragment key={p.id}>
                  <tr className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{p.resident}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.room}</td>
                    <td className="px-4 py-3 text-foreground">{p.chargeType}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{usd(p.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.dateOccurred}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.loggedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => approve(p.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => { setRejectingId(p.id); setRejectReason(""); }}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                  {rejectingId === p.id && (
                    <tr className="border-b border-border bg-muted/20">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection…"
                            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                          />
                          <button
                            onClick={() => confirmReject(p.id)}
                            disabled={!rejectReason.trim()}
                            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-40"
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectReason(""); }}
                            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recently Approved — Last 14 Days
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left">Resident</th>
                <th className="px-4 py-3 text-left">Charge Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Date Approved</th>
                <th className="px-4 py-3 text-left">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {RECENTLY_APPROVED.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{a.resident}</td>
                  <td className="px-4 py-3 text-foreground">{a.chargeType}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{usd(a.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.dateApproved}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-base font-semibold text-foreground">Add Charge</div>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Resident</span>
                <select
                  value={form.resident}
                  onChange={(e) => setForm((f) => ({ ...f, resident: e.target.value }))}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  {RESIDENT_DIRECTORY.map((r) => (
                    <option key={r.name} value={r.name}>{r.name} · {r.room}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Charge Type</span>
                <select
                  value={form.chargeType}
                  onChange={(e) => {
                    const ct = e.target.value;
                    const def = CHARGE_LIBRARY.find((c) => c.type === ct)?.defaultAmount ?? 0;
                    setForm((f) => ({ ...f, chargeType: ct, amount: String(def) }));
                  }}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  {CHARGE_LIBRARY.map((c) => (
                    <option key={c.type} value={c.type}>{c.type}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Date Occurred</span>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Logged By</span>
                <input
                  readOnly
                  value={CURRENT_USER}
                  className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">Note <span className="text-muted-foreground/70">(optional)</span></span>
                <input
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Add a brief note…"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={submitAdd}
                className="rounded-md px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#83C0DF" }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}