import React from 'react';
import AdminAddUserForm from './AdminAddUserForm';

export default function AdminUsersTab({ users, onAddUser, isActive }) {
  if (!isActive) return null;

  return (
    <section className="tab-pane flex flex-col gap-gutter" id="tab-users">
      {/*  Inline Invite Box  */}
      <AdminAddUserForm onAddUser={onAddUser} />
      
      {/*  Active User Roster  */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Active Roster &amp; Credentials</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time status of authenticated Finora console participants.</p>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">search</span>
            <input className="pl-9 pr-3 py-1.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none w-64" placeholder="Filter by name, role, email..." type="text"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Access Scope</th>
                <th className="py-2.5 px-3">Security Status</th>
                <th className="py-2.5 px-3">Last Active</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-card">
              {users.map(u => (
                <tr className="hover:bg-surface-container-lowest transition-colors group" key={u.id || u.email}>
                  <td className="px-space-md py-space-md whitespace-nowrap">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface font-bold text-sm shrink-0">
                        {u.name ? u.name.charAt(0) : '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-md font-semibold text-on-surface">{u.name}</span>
                        <span className="font-body-sm text-on-surface-variant">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-space-md py-space-md whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-body-md font-medium text-on-surface">{u.role}</span>
                      <span className="font-body-sm text-on-surface-variant">{u.scope}</span>
                    </div>
                  </td>
                  <td className="px-space-md py-space-md whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-label-sm text-label-sm ${(u.status || '').includes('Active') ? 'bg-surface-container-lowest border border-outline-variant text-on-surface' : 'bg-surface-container-lowest border border-error-container text-error'}`}>
                      {(u.status || '').includes('Active') && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>}
                      {u.status}
                    </span>
                  </td>
                  <td className="px-space-md py-space-md whitespace-nowrap text-on-surface-variant font-body-sm">{u.last_active}</td>
                  <td className="px-space-md py-space-md whitespace-nowrap text-right">
                    <button className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
