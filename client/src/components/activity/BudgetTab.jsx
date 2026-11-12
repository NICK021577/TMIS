import { useState } from 'react';
import { Badge, Button, Callout, DataTable, Drawer, Field, Icon, Metric, Panel, PanelTitle, inputCls, textareaCls } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../hooks/useStore';
import { BUDGET_CATEGORIES, FUNDING, peso } from '../../data/mockData';
import { estOf } from '../../lib/budgetModel';

const RESOURCES = ['None', 'Rubber seedlings', 'Fertilizer', 'Training kits', 'Venue'];
const todayStr = '2025-06-18';

function AddItemDrawer({ activityId, onClose }) {
  const { addItem, notify } = useStore();
  const [f, setF] = useState({ category: BUDGET_CATEGORIES[0], item: '', qty: 1, unit: 0, funding: FUNDING[0], resource: 'None' });
  const est = Number(f.qty) * Number(f.unit);
  return (
    <Drawer
      title="Add budget item"
      subtitle="Estimated cost for this activity"
      onClose={onClose}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={!f.item.trim() || !(est > 0)} onClick={() => { addItem({ activityId, category: f.category, item: f.item.trim(), qty: Number(f.qty), unit: Number(f.unit), funding: f.funding, resource: f.resource === 'None' ? undefined : f.resource }); notify?.('Budget item added'); onClose(); }}>Add item</Button>
      </>}
    >
      <Field label="Category"><select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{BUDGET_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Item"><input className={inputCls} value={f.item} onChange={(e) => setF({ ...f, item: e.target.value })} placeholder="e.g. Training hall rental" autoFocus /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Quantity"><input type="number" min="1" className={inputCls} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></Field>
        <Field label="Unit cost (₱)"><input type="number" min="0" className={inputCls} value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} /></Field>
      </div>
      <Field label="Funding source"><select className={inputCls} value={f.funding} onChange={(e) => setF({ ...f, funding: e.target.value })}>{FUNDING.map((c) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Linked resource"><select className={inputCls} value={f.resource} onChange={(e) => setF({ ...f, resource: e.target.value })}>{RESOURCES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      <div className="glass-inset flex items-center justify-between rounded-2xl px-4 py-3 text-[13px]">
        <span className="text-ink-500">Estimated amount</span><strong className="font-medium text-ink-950">{peso(est || 0)}</strong>
      </div>
    </Drawer>
  );
}

function ActualDrawer({ item, onClose }) {
  const { recordActual, notify } = useStore();
  const [f, setF] = useState({ actual: item.actual ?? '', date: item.actualDate ?? todayStr, receipt: item.receipt ?? '', remarks: item.remarks ?? '' });
  return (
    <Drawer
      title="Record actual cost"
      subtitle={item.item}
      onClose={onClose}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={!(Number(f.actual) >= 0) || f.actual === ''} onClick={() => { recordActual(item.id, { actual: Number(f.actual), actualDate: f.date, receipt: f.receipt || undefined, remarks: f.remarks || undefined }); notify?.('Actual cost recorded'); onClose(); }}>Save</Button>
      </>}
    >
      <Callout tone="info" icon="file">Estimate: <strong>{peso(estOf(item))}</strong>. A receipt also appears in Documents with type Receipt.</Callout>
      <Field label="Actual amount (₱)"><input type="number" min="0" className={inputCls} value={f.actual} onChange={(e) => setF({ ...f, actual: e.target.value })} autoFocus /></Field>
      <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      <Field label="Receipt">
        <input type="file" className={inputCls + ' pt-2'} onChange={(e) => setF({ ...f, receipt: e.target.files?.[0]?.name ?? '' })} />
        {f.receipt && <small className="text-[11px] text-ink-500">{f.receipt}</small>}
      </Field>
      <Field label="Remarks"><textarea rows={3} className={textareaCls} value={f.remarks} onChange={(e) => setF({ ...f, remarks: e.target.value })} /></Field>
    </Drawer>
  );
}

export default function BudgetTab({ activity }) {
  const { role } = useAuth();
  const { items, annual, activities, removeItem, notify } = useStore();
  const [adding, setAdding] = useState(false);
  const [recording, setRecording] = useState(null);

  const isAdmin = role === 'Agency Administrator' || role === 'Super Admin';
  const canRecord = isAdmin || role === 'Committee Member';

  if (role === 'Resource Person') {
    return (
      <Panel className="grid place-items-center gap-1 py-14 text-center">
        <Icon name="lock" size={22} className="text-ink-400" />
        <strong className="text-sm font-medium text-ink-950">No access</strong>
        <span className="text-xs text-ink-500">Budgets are visible to Agency Administrators and Committee Members.</span>
      </Panel>
    );
  }

  const mine = items.filter((i) => i.activityId === activity.id);
  const est = mine.reduce((s, i) => s + estOf(i), 0);
  const recorded = mine.filter((i) => i.actual != null);
  const act = recorded.reduce((s, i) => s + i.actual, 0);
  const diff = act - est;
  const status = !mine.length ? 'No budget' : recorded.length && act > est ? 'Over budget' : 'Within budget';
  const usedElsewhere = activities.reduce((s, a) => s + items.filter((i) => i.activityId === a.id).reduce((t, i) => t + estOf(i), 0), 0);
  const remaining = annual - usedElsewhere;

  const columns = [
    { key: 'category', label: 'Category', render: (i) => <Badge value={i.category} tone="muted" variant="pill" /> },
    { key: 'item', label: 'Item', render: (i) => <div><strong className="block font-medium text-ink-950">{i.item}</strong>{i.resource && <small className="text-[11px] text-ink-500">Linked: {i.resource}</small>}</div> },
    { key: 'qty', label: 'Qty × unit', render: (i) => <span className="whitespace-nowrap text-ink-600">{i.qty} × {peso(i.unit)}</span> },
    { key: 'est', label: 'Estimated', className: 'text-right', render: (i) => <span className="tabular-nums">{peso(estOf(i))}</span> },
    { key: 'funding', label: 'Funding', render: (i) => <span className="text-ink-600">{i.funding}</span> },
    { key: 'actual', label: 'Actual', className: 'text-right', render: (i) => (i.actual != null ? <span className="tabular-nums">{peso(i.actual)}</span> : <span className="text-ink-400">—</span>) },
    { key: 'diff', label: 'Difference', className: 'text-right', render: (i) => (i.actual != null ? <span className={`tabular-nums ${i.actual > estOf(i) ? 'text-danger' : 'text-emerald-600'}`}>{peso(i.actual - estOf(i))}</span> : <span className="text-ink-400">—</span>) },
    { key: 'receipt', label: 'Receipt', render: (i) => (i.receipt ? <span className="text-xs text-brand-700">{i.receipt}</span> : <span className="text-ink-400">—</span>) },
    {
      key: 'act', label: '', className: 'text-right',
      render: (i) => (
        <div className="flex justify-end gap-1">
          {canRecord && <Button variant="ghost" size="sm" onClick={() => setRecording(i)}>{i.actual != null ? 'Edit actual' : 'Record actual'}</Button>}
          {isAdmin && <button aria-label="Delete item" onClick={() => { removeItem(i.id); notify?.('Budget item removed'); }} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-white/70 hover:text-danger"><Icon name="trash" size={14} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Total estimated" value={peso(est)} />
        <Metric label="Total actual" value={recorded.length ? peso(act) : '—'} tone="brand" />
        <Metric label="Difference" value={recorded.length ? peso(diff) : '—'} tone={diff > 0 ? 'bad' : 'default'} />
        <div className="glass-panel flex flex-col justify-between rounded-[18px] p-4">
          <span className="text-xs text-ink-500">Status</span>
          <Badge value={status} className="!text-[13px]" />
        </div>
      </div>

      <Callout tone="info" icon="award">
        This activity uses <strong>{peso(est)}</strong> of the <strong>{peso(remaining + est)}</strong> remaining annual budget. TMIS records and compares costs only. It does not process payments, procurement or inventory.
      </Callout>

      <Panel pad={false} className="overflow-hidden">
        <div className="p-5 pb-3">
          <PanelTitle title="Budget line items" subtitle="Estimates versus actual costs">
            {isAdmin && <Button size="sm" icon="plus" onClick={() => setAdding(true)}>Add item</Button>}
          </PanelTitle>
        </div>
        {mine.length ? (
          <DataTable
            columns={columns}
            rows={mine}
            footer={
              <tr className="border-t border-[var(--glass-divider)] bg-white/30 text-[13px] font-medium text-ink-950">
                <td className="px-5 py-3" colSpan={3}>Total</td>
                <td className="px-5 py-3 text-right tabular-nums">{peso(est)}</td>
                <td />
                <td className="px-5 py-3 text-right tabular-nums">{recorded.length ? peso(act) : '—'}</td>
                <td className="px-5 py-3 text-right tabular-nums">{recorded.length ? peso(diff) : '—'}</td>
                <td colSpan={2} />
              </tr>
            }
          />
        ) : (
          <div className="px-6 py-12 text-center text-[13px] text-ink-500">No budget items yet.</div>
        )}
      </Panel>

      {adding && <AddItemDrawer activityId={activity.id} onClose={() => setAdding(false)} />}
      {recording && <ActualDrawer key={recording.id} item={recording} onClose={() => setRecording(null)} />}
    </div>
  );
}
