import { ArrowUpRight } from 'lucide-react'
import type { ErasmusOpportunity } from '../types/erasmus'

export function ComparePanel({ opportunities, onBrowse }: { opportunities: ErasmusOpportunity[]; onBrowse: () => void }) {
  const compared = opportunities.slice(0, 3)

  return <section className="workspace-panel">
    <span className="section-kicker">COMPARE DESTINATIONS</span>
    <h2>Compare your saved choices.</h2>
    {compared.length < 2 ? <>
      <p>Save at least two destinations to compare GPA requirements, grants, monthly costs, and deadlines side by side.</p>
      <button className="primary-button" onClick={onBrowse}>Discover destinations <ArrowUpRight size={15} /></button>
    </> : <div className="compare-table-wrap">
      <table className="compare-table">
        <thead><tr><th scope="col">Details</th>{compared.map((item) => <th scope="col" key={item.id}>{item.university}<small>{item.city}, {item.country}</small></th>)}</tr></thead>
        <tbody>
          <tr><th scope="row">Minimum GPA</th>{compared.map((item) => <td key={item.id}>{item.minimumGpa.toFixed(1)}</td>)}</tr>
          <tr><th scope="row">Grant / month</th>{compared.map((item) => <td key={item.id}>EUR {item.monthlyGrant}</td>)}</tr>
          <tr><th scope="row">Estimated monthly cost</th>{compared.map((item) => <td key={item.id}>EUR {item.studentBudgetEstimate}</td>)}</tr>
          <tr><th scope="row">Deadline</th>{compared.map((item) => <td key={item.id}>{new Date(item.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</td>)}</tr>
          <tr><th scope="row">Source status</th>{compared.map((item) => <td key={item.id}>{item.verificationStatus === 'Verified' ? 'Verified' : 'Needs review'}</td>)}</tr>
        </tbody>
      </table>
    </div>}
  </section>
}

export function PlannerPanel({ tasks, completed, onToggle }: {
  tasks: string[]
  completed: string[]
  onToggle: (task: string) => void
}) {
  return <section className="workspace-panel">
    <span className="section-kicker">APPLICATION PLANNER</span>
    <h2>Keep your exchange plan moving.</h2>
    <p>{completed.length} of {tasks.length} steps complete. Your checklist is saved in this browser.</p>
    <div className="planner-preview">{tasks.map((task) => <label className="planner-task" key={task}>
      <input type="checkbox" checked={completed.includes(task)} onChange={() => onToggle(task)} />
      <span>{task}</span>
    </label>)}</div>
  </section>
}
