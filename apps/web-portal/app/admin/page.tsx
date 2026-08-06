
export default function Page() {
  return (
    <>
      
{/* SideNavBar */}
<nav className="flex flex-col h-full w-64 bg-surface-container-low border-r border-outline-variant py-lg px-md gap-sm shrink-0 z-20">
{/* Header */}
<div className="flex items-center gap-md mb-lg px-sm">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: '\'FILL\' 1' }}>admin_panel_settings</span>
</div>
<div>
<h2 className="text-headline-md font-headline-md text-primary tracking-tight" style={{ fontSize: '18px', lineHeight: '24px' }}>Active Portal</h2>
<p className="text-label-md font-label-md text-on-surface-variant">Enterprise Banking</p>
</div>
</div>
{/* Navigation Links */}
<div className="flex flex-col gap-xs flex-1">
{/* Active Tab: Dashboard */}
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container font-bold rounded-lg transition-transform duration-150 active:scale-[0.98]" href="#">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '\'FILL\' 1' }}>dashboard</span>
<span className="text-label-md font-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span className="text-label-md font-label-md">Accounts</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="text-label-md font-label-md">Transactions</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors" href="#">
<span className="material-symbols-outlined">analytics</span>
<span className="text-label-md font-label-md">Reports</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="text-label-md font-label-md">Settings</span>
</a>
</div>
{/* Footer Links */}
<div className="flex flex-col gap-xs mt-auto pt-lg border-t border-slate-200">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors" href="#">
<span className="material-symbols-outlined">help</span>
<span className="text-label-md font-label-md">Help Support</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="text-label-md font-label-md">Logout</span>
</a>
</div>
</nav>
{/* Main Content Area */}
<div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
{/* TopNavBar */}
<header className="bg-surface-container-lowest border-b border-outline-variant w-full h-16 shrink-0 flex justify-between items-center px-lg z-10 relative shadow-sm">
<div className="flex items-center gap-lg h-full">
<span className="text-title-lg font-title-lg font-bold text-primary tracking-tight">BankCore</span>
{/* Nav Links */}
<nav className="hidden md:flex h-full ml-xl gap-xl">
<a className="flex items-center h-full text-on-surface-variant hover:bg-surface-container transition-colors px-sm text-label-md font-label-md" href="#">Customer</a>
<a className="flex items-center h-full text-on-surface-variant hover:bg-surface-container transition-colors px-sm text-label-md font-label-md" href="#">Employee</a>
{/* Active Link */}
<a className="flex items-center h-full text-primary border-b-2 border-secondary font-bold px-sm text-label-md font-label-md opacity-90 transition-all duration-100 bg-surface-container" href="#">Admin</a>
</nav>
</div>
<div className="flex items-center gap-sm">
{/* Search (Placeholder style as requested on_left technically, but placing right for balance in this layout if not specified positionally in detailed flex) */}
<div className="relative hidden lg:block mr-md">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
<input className="pl-xl pr-sm py-unit h-8 bg-slate-100 border-none rounded-DEFAULT text-body-sm font-body-sm focus:ring-1 focus:ring-primary w-64 transition-all" placeholder="Search system..." type="text"/>
</div>
<button className="p-unit rounded-full text-on-surface-variant hover:bg-surface-container transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
</button>
<button className="p-unit rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined">apps</span>
</button>
<div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden ml-sm border border-slate-300 shrink-0">
<img alt="User profile with role indicator" className="w-full h-full object-cover" data-alt="A professional corporate headshot of a system administrator against a clean white background, high quality lighting, professional attire." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM2_s9ulbZxmwbtdxT_0XmPZ8mt-f1AjbQ4PtNfHrlbylMUZbFVzj7w3oA8ZD3hSG28VcYBhD7KJ7kjplnn8mvvJO6h1LjBkZb61Jgd1fnSf8hJ-Mva3FcsrNNIFSuDAOEHhsPY1b3s1XN9TSC8rR1QIIJdqFAubb5IZWRtXjIbel0E_KB3LzllQtCdaXp9UT4M3aVKPoAlr-lqBRfA0cbK4f7enmbfVl198-2RBSqgIJH5ZXEfncjJQ"/>
</div>
</div>
</header>
{/* Dashboard Canvas */}
<main className="flex-1 overflow-y-auto admin-scroll p-lg">
<div className="max-w-[1400px] mx-auto flex flex-col gap-lg">
{/* Page Header */}
<div className="flex justify-between items-end mb-sm">
<div>
<h1 className="text-headline-md font-headline-md text-slate-900 tracking-tight">System Control Center</h1>
<p className="text-body-sm font-body-sm text-slate-500 mt-xs">Real-time health monitoring and security oversight.</p>
</div>
<div className="flex gap-sm">
<button className="px-md py-unit bg-slate-100 border border-slate-200 text-slate-700 text-label-md font-label-md rounded-DEFAULT hover:bg-slate-200 transition-colors flex items-center gap-xs shadow-sm">
<span className="material-symbols-outlined text-[16px]">download</span> Export Report
                        </button>
</div>
</div>
{/* Bento Grid Metrics */}
<div className="grid grid-cols-12 gap-gutter">
{/* Server Load (Col 3) */}
<div className="col-span-12 md:col-span-4 lg:col-span-3 bg-surface-container-lowest rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-md flex flex-col">
<div className="flex justify-between items-center mb-md">
<h3 className="text-title-md font-title-md text-slate-800">Core Load</h3>
<span className="material-symbols-outlined text-slate-400 text-[20px]">memory</span>
</div>
<div className="flex items-end gap-sm mb-sm">
<span className="text-headline-lg font-headline-lg text-slate-900 leading-none">78%</span>
<span className="text-label-md font-label-md text-warning-amber flex items-center mb-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +5%
                            </span>
</div>
<div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-auto">
<div className="bg-chart-4 h-full w-[78%] rounded-full"></div>
</div>
<p className="text-label-md font-label-md text-slate-500 mt-xs text-right">Capacity Warning</p>
</div>
{/* API Latency (Col 6) */}
<div className="col-span-12 md:col-span-8 lg:col-span-6 bg-surface-container-lowest rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-md flex flex-col">
<div className="flex justify-between items-center mb-md">
<h3 className="text-title-md font-title-md text-slate-800">API Gateway Latency</h3>
<div className="flex items-center gap-xs text-label-md font-label-md text-slate-500">
<span className="w-2 h-2 rounded-full bg-success-emerald"></span> Optimal
                            </div>
</div>
<div className="flex-1 flex items-end gap-unit h-24 mt-sm border-b border-dashed border-slate-200 pb-xs relative">
{/* Simulated Sparkline Bars */}
<div className="w-full flex items-end justify-between h-full px-xs">
<div className="w-1/12 bg-chart-1 opacity-40 hover:opacity-100 transition-opacity rounded-t-sm h-[30%]"></div>
<div className="w-1/12 bg-chart-1 opacity-40 hover:opacity-100 transition-opacity rounded-t-sm h-[45%]"></div>
<div className="w-1/12 bg-chart-1 opacity-40 hover:opacity-100 transition-opacity rounded-t-sm h-[35%]"></div>
<div className="w-1/12 bg-chart-1 opacity-40 hover:opacity-100 transition-opacity rounded-t-sm h-[60%]"></div>
<div className="w-1/12 bg-chart-1 opacity-40 hover:opacity-100 transition-opacity rounded-t-sm h-[40%]"></div>
<div className="w-1/12 bg-chart-1 opacity-40 hover:opacity-100 transition-opacity rounded-t-sm h-[25%]"></div>
<div className="w-1/12 bg-chart-1 opacity-40 hover:opacity-100 transition-opacity rounded-t-sm h-[50%]"></div>
<div className="w-1/12 bg-chart-1 opacity-80 rounded-t-sm h-[35%] relative group">
<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded hidden group-hover:block z-10 whitespace-nowrap">45ms</div>
</div>
</div>
<div className="absolute top-1/2 w-full border-t border-slate-200 border-dashed"></div>
</div>
<div className="flex justify-between mt-xs text-label-md font-label-md text-slate-400">
<span>-1h</span>
<span>Avg: 42ms</span>
<span>Now</span>
</div>
</div>
{/* Fraud Alerts Summary (Col 3) */}
<div className="col-span-12 lg:col-span-3 bg-error-container rounded-xl border border-error-rose/20 shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-md flex flex-col justify-between">
<div>
<div className="flex justify-between items-center mb-xs">
<h3 className="text-title-md font-title-md text-on-error-container">Fraud Alerts</h3>
<span className="material-symbols-outlined text-error-rose text-[20px]">warning</span>
</div>
<p className="text-body-sm font-body-sm text-on-error-container/80">Requires immediate review</p>
</div>
<div className="mt-lg flex items-baseline gap-xs">
<span className="text-display-lg font-display-lg text-error-rose leading-none">12</span>
<span className="text-label-md font-label-md text-error-rose/70 font-semibold uppercase tracking-wider">Critical</span>
</div>
<button className="mt-md w-full py-unit bg-white/50 hover:bg-white/80 text-error-rose text-label-md font-label-md rounded-DEFAULT transition-colors border border-error-rose/10 font-medium">
                            Review Queue
                        </button>
</div>
</div>
{/* Secondary Row: Audit Log & User Management */}
<div className="grid grid-cols-12 gap-gutter">
{/* System Audit Log (Col 8) */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
<div className="bg-slate-100/50 border-b border-slate-200 p-md flex justify-between items-center">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-slate-500 text-[18px]">history</span>
<h3 className="text-title-md font-title-md text-slate-800">Live Audit Log</h3>
</div>
<button className="text-primary text-label-md font-label-md hover:underline font-medium">View Full Log</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead className="bg-slate-50/80 border-b border-slate-200 text-label-md font-label-md text-slate-500 uppercase tracking-wider">
<tr>
<th className="py-sm px-md font-medium">Timestamp</th>
<th className="py-sm px-md font-medium">Event ID</th>
<th className="py-sm px-md font-medium">Service</th>
<th className="py-sm px-md font-medium">Status</th>
<th className="py-sm px-md font-medium">Actor</th>
</tr>
</thead>
<tbody className="text-body-sm font-body-sm text-slate-700 divide-y divide-slate-100">
<tr className="admin-table-row hover:bg-slate-50 transition-colors">
<td className="px-md whitespace-nowrap text-mono-data font-mono-data text-slate-500">10:42:01.05Z</td>
<td className="px-md whitespace-nowrap font-medium text-slate-900">AUTH-992</td>
<td className="px-md whitespace-nowrap">Identity Service</td>
<td className="px-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 text-error-rose">
<span className="w-1.5 h-1.5 rounded-full bg-error-rose"></span> Failed
                                            </span>
</td>
<td className="px-md whitespace-nowrap">sys_admin_bot</td>
</tr>
<tr className="admin-table-row hover:bg-slate-50 transition-colors">
<td className="px-md whitespace-nowrap text-mono-data font-mono-data text-slate-500">10:41:15.22Z</td>
<td className="px-md whitespace-nowrap font-medium text-slate-900">CFG-810</td>
<td className="px-md whitespace-nowrap">Gateway API</td>
<td className="px-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 text-success-emerald">
<span className="w-1.5 h-1.5 rounded-full bg-success-emerald"></span> Success
                                            </span>
</td>
<td className="px-md whitespace-nowrap">jsmith_ops</td>
</tr>
<tr className="admin-table-row hover:bg-slate-50 transition-colors">
<td className="px-md whitespace-nowrap text-mono-data font-mono-data text-slate-500">10:40:05.99Z</td>
<td className="px-md whitespace-nowrap font-medium text-slate-900">DB-SYNC-44</td>
<td className="px-md whitespace-nowrap">Core DB Cluster</td>
<td className="px-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 text-warning-amber">
<span className="w-1.5 h-1.5 rounded-full bg-warning-amber"></span> Delayed
                                            </span>
</td>
<td className="px-md whitespace-nowrap">system_cron</td>
</tr>
<tr className="admin-table-row hover:bg-slate-50 transition-colors">
<td className="px-md whitespace-nowrap text-mono-data font-mono-data text-slate-500">10:38:50.11Z</td>
<td className="px-md whitespace-nowrap font-medium text-slate-900">AUTH-991</td>
<td className="px-md whitespace-nowrap">Identity Service</td>
<td className="px-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 text-success-emerald">
<span className="w-1.5 h-1.5 rounded-full bg-success-emerald"></span> Success
                                            </span>
</td>
<td className="px-md whitespace-nowrap">sys_admin_bot</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* User Management Quick Links (Col 4) */}
<div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-md flex flex-col">
<div className="flex items-center gap-sm mb-md pb-sm border-b border-slate-100">
<span className="material-symbols-outlined text-slate-500 text-[18px]">manage_accounts</span>
<h3 className="text-title-md font-title-md text-slate-800">User Management</h3>
</div>
<div className="flex flex-col gap-unit flex-1">
<a className="flex items-center justify-between p-sm rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group" href="#">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded bg-primary-fixed/30 text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">person_add</span>
</div>
<div>
<p className="text-body-sm font-body-sm font-medium text-slate-900">Provision New Employee</p>
<p className="text-label-md font-label-md text-slate-500">Setup LDAP &amp; VPN Access</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[18px]">chevron_right</span>
</a>
<a className="flex items-center justify-between p-sm rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group" href="#">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded bg-warning-amber/20 text-warning-amber flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">vpn_key</span>
</div>
<div>
<p className="text-body-sm font-body-sm font-medium text-slate-900">Reset MFA Tokens</p>
<p className="text-label-md font-label-md text-slate-500">Handle locked accounts</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[18px]">chevron_right</span>
</a>
<a className="flex items-center justify-between p-sm rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group" href="#">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center">
<span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
</div>
<div>
<p className="text-body-sm font-body-sm font-medium text-slate-900">Role Permissions</p>
<p className="text-label-md font-label-md text-slate-500">Audit system access levels</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[18px]">chevron_right</span>
</a>
</div>
</div>
</div>
</div>
</main>
</div>

    </>
  );
}
