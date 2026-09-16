import React from 'react';

export default function AdminAddUserForm({ onAddUser }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Provision New Team Teammate</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Send a cryptographically signed workspace invitation.</p>
        </div>
        <span className="px-2.5 py-1 bg-surface-container-low text-primary rounded-full font-label-sm text-label-sm">Available Seats: 6 / 30</span>
      </div>
      <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md items-end" onSubmit={onAddUser}>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="team_name">Full Name</label>
          <input className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_rgba(79,70,229,0.25)] transition-all" id="team_name" name="team_name" placeholder="e.g. Sarah Jenkins" required type="text"/>
        </div>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="team_email">Work Email</label>
          <input className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_rgba(79,70,229,0.25)] transition-all" id="team_email" name="team_email" placeholder="s.jenkins@finora.io" required type="email"/>
        </div>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="team_role">Organizational Role</label>
          <select className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_rgba(79,70,229,0.25)] transition-all" id="team_role" name="team_role">
            <option>Finance Analyst</option>
            <option>Compliance Auditor</option>
            <option>Billing Manager</option>
            <option>Security Admin</option>
          </select>
        </div>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="team_scope">Ledger Scope</label>
          <select className="w-full px-3 py-2 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:shadow-[0_0_0_2px_rgba(79,70,229,0.25)] transition-all" id="team_scope" name="team_scope">
            <option>Full Ledger Access</option>
            <option>Read-Only Operations</option>
            <option>Code Setup Only</option>
          </select>
        </div>
        <div>
          <button className="w-full h-10 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2" type="submit">
            <span className="material-symbols-outlined text-lg">mail</span>
            <span>Send Invitation</span>
          </button>
        </div>
      </form>
    </div>
  );
}
