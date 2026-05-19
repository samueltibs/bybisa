import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface MonthRow { month: string; income: number; expenses: number; net: number; runningTotal: number }

export default function AdminAccounting() {
  const [rows, setRows] = useState<MonthRow[]>([])
  const [totals, setTotals] = useState({ income: 0, expenses: 0, net: 0 })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: purchases }, { data: expenseData }] = await Promise.all([
      supabase.from('bybisa_purchases').select('amount, purchased_at').eq('status', 'paid'),
      supabase.from('bybisa_expenses').select('amount, date'),
    ])

    const incomeByMonth: Record<string, number> = {}
    const expenseByMonth: Record<string, number> = {}
    const allMonths = new Set<string>()

    ;(purchases || []).forEach(p => {
      const m = p.purchased_at?.substring(0, 7) || ''
      if (m) { incomeByMonth[m] = (incomeByMonth[m] || 0) + Number(p.amount); allMonths.add(m) }
    })
    ;(expenseData || []).forEach(e => {
      const m = e.date?.substring(0, 7) || ''
      if (m) { expenseByMonth[m] = (expenseByMonth[m] || 0) + Number(e.amount); allMonths.add(m) }
    })

    const sorted = Array.from(allMonths).sort()
    let running = 0
    const monthRows: MonthRow[] = sorted.map(m => {
      const inc = incomeByMonth[m] || 0
      const exp = expenseByMonth[m] || 0
      const net = inc - exp
      running += net
      return { month: m, income: inc, expenses: exp, net, runningTotal: running }
    })

    const totalInc = monthRows.reduce((s, r) => s + r.income, 0)
    const totalExp = monthRows.reduce((s, r) => s + r.expenses, 0)
    setRows(monthRows)
    setTotals({ income: totalInc, expenses: totalExp, net: totalInc - totalExp })
  }

  function monthLabel(m: string) {
    const [y, mo] = m.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(mo)-1]} ${y}`
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand mb-6">Accounting â P&L</h1>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total Income</span>
          <p className="text-xl font-extrabold text-green-700 mt-1">{formatPrice(totals.income, 'UGX')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Total Expenses</span>
          <p className="text-xl font-extrabold text-red-600 mt-1">{formatPrice(totals.expenses, 'UGX')}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Net Profit</span>
          <p className={`text-xl font-extrabold mt-1 ${totals.net >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatPrice(totals.net, 'UGX')}</p>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Month</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Income</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Expenses</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Net</th>
            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">Running Total</th>
          </tr></thead>
          <tbody className="divide-y divide-border-light">
            {rows.map(r => (
              <tr key={r.month} className="hover:bg-bg">
                <td className="px-4 py-3 font-medium text-brand">{monthLabel(r.month)}</td>
                <td className="px-4 py-3 text-right text-green-700 font-semibold">{formatPrice(r.income, 'UGX')}</td>
                <td className="px-4 py-3 text-right text-red-600 font-semibold">{formatPrice(r.expenses, 'UGX')}</td>
                <td className={`px-4 py-3 text-right font-bold ${r.net >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatPrice(r.net, 'UGX')}</td>
                <td className={`px-4 py-3 text-right font-bold ${r.runningTotal >= 0 ? 'text-brand' : 'text-red-600'}`}>{formatPrice(r.runningTotal, 'UGX')}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-text-light">No data yet â income comes from paid orders, expenses from the Expenses page</td></tr>}
          </tbody>
          {rows.length > 0 && (
            <tfoot><tr className="border-t-2 border-brand bg-bg">
              <td className="px-4 py-3 font-extrabold text-brand uppercase text-xs tracking-wider">Total</td>
              <td className="px-4 py-3 text-right font-extrabold text-green-700">{formatPrice(totals.income, 'UGX')}</td>
              <td className="px-4 py-3 text-right font-extrabold text-red-600">{formatPrice(totals.expenses, 'UGX')}</td>
              <td className={`px-4 py-3 text-right font-extrabold ${totals.net >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatPrice(totals.net, 'UGX')}</td>
              <td className="px-4 py-3"></td>
            </tr></tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
