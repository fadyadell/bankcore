
export default function Page() {
  return (
    <>
      
{/* TopNavBar */}
<header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant">
<div className="flex justify-between items-center w-full px-margin-desktop h-16 max-w-[1280px] mx-auto">
<div className="flex items-center gap-md">
<span className="text-title-lg font-title-lg font-bold text-primary">BankCore</span>
</div>
<nav className="hidden md:flex gap-lg h-full items-center">
<a className="text-on-surface-variant hover:bg-surface-container transition-colors h-full flex items-center px-sm" href="#">
<span className="text-label-md font-label-md">Customer</span>
</a>
<a className="text-primary border-b-2 border-secondary font-bold opacity-80 transition-all duration-100 h-full flex items-center px-sm" href="#">
<span className="text-label-md font-label-md">Employee</span>
</a>
<a className="text-on-surface-variant hover:bg-surface-container transition-colors h-full flex items-center px-sm" href="#">
<span className="text-label-md font-label-md">Admin</span>
</a>
</nav>
<div className="flex items-center gap-sm">
{/* Search Bar Placeholder */}
<div className="relative hidden lg:block mr-md">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
<input className="pl-xl pr-sm py-unit rounded-DEFAULT border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none w-64" placeholder="Customer Lookup..." type="text"/>
</div>
<button className="p-unit text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="p-unit text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="apps">apps</span>
</button>
<img alt="User profile with role indicator" className="w-8 h-8 rounded-full ml-sm object-cover border border-outline-variant" data-alt="A highly detailed close-up of a professional corporate headshot of a banking employee in a modern light-filled office. The image should feature a neat, smart-casual appearance, representing high-stakes fintech environment reliability. Soft, natural lighting with a subtle light blue corporate backdrop. Minimalist and clean aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1ecjcX1ir2rRr00C1-LeeIpS3gKAkengw-_RsEn2cGKexFan4DTot5opc-zdJ1wWleR1vYpnD9M5RCvf8DGncYzerwDp8ThBLKO4PacvPFs-czLeLI09aSddBe35Bh1lyXYrXcNcyoVB7fuXwNEv_9lMNjkkyc-UdqYafH0Uh3JU6WNL12fh0QI33bcFZpXtUZ4_KN0imza4s3yIC7SMeh4Iz0VjOEpGAJ320zTpFa54TkrqANGXjmg"/>
</div>
</div>
</header>
{/* SideNavBar */}
<aside className="hidden md:flex flex-col bg-surface-container-low border-r border-outline-variant h-full w-64 pt-24 pb-lg px-md gap-sm fixed left-0 z-40">
<div className="mb-lg px-unit">
<h2 className="text-title-md font-title-md text-primary">Active Portal</h2>
<p className="text-body-sm font-body-sm text-on-surface-variant">Enterprise Banking</p>
</div>
<nav className="flex-1 flex flex-col gap-xs">
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container font-bold rounded-lg scale-[0.98] transition-transform duration-150" href="#">
<span className="material-symbols-outlined" data-weight="fill" style={{ fontVariationSettings: '\'FILL\' 1' }}>dashboard</span>
<span className="text-label-md font-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span className="text-label-md font-label-md">Accounts</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="text-label-md font-label-md">Transactions</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">analytics</span>
<span className="text-label-md font-label-md">Reports</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="text-label-md font-label-md">Settings</span>
</a>
</nav>
<div className="flex flex-col gap-xs mt-auto pt-md border-t border-outline-variant">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">help</span>
<span className="text-label-md font-label-md">Help Support</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors rounded-lg" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="text-label-md font-label-md">Logout</span>
</a>
</div>
</aside>
{/* Main Content Canvas */}
<main className="flex-1 ml-0 md:ml-64 pt-16 h-full overflow-y-auto">
<div className="max-w-[1600px] mx-auto p-gutter lg:p-xl space-y-gutter">
{/* Header Section */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
<div>
<h1 className="text-headline-lg font-headline-lg text-on-surface">Operational Overview</h1>
<p className="text-body-md font-body-md text-on-surface-variant mt-xs">Real-time task queue and manual review status.</p>
</div>
<div className="flex gap-sm">
<button className="px-md py-unit bg-surface-container border border-outline-variant rounded-DEFAULT text-label-md font-label-md text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-xs">
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>filter_list</span>
                        Filter Queue
                    </button>
<button className="px-md py-unit bg-primary rounded-DEFAULT text-label-md font-label-md text-on-primary hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-xs shadow-sm">
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
                        Refresh Data
                    </button>
</div>
</div>
{/* Metrics Bento Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
{/* KYC Review Metric */}
<div className="bg-surface-container-lowest p-md rounded-lg border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between h-32 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-shadow">
<div className="flex justify-between items-start">
<span className="text-label-md font-label-md text-on-surface-variant">Pending KYC Review</span>
<span className="material-symbols-outlined text-chart-4" style={{ fontSize: '20px' }}>recent_actors</span>
</div>
<div>
<div className="text-headline-lg font-headline-lg text-on-surface">42</div>
<div className="text-body-sm font-body-sm text-error-rose flex items-center gap-xs mt-1">
<span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span>
<span>+12 from yesterday</span>
</div>
</div>
</div>
{/* Transaction Alerts Metric */}
<div className="bg-surface-container-lowest p-md rounded-lg border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between h-32 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-shadow">
<div className="flex justify-between items-start">
<span className="text-label-md font-label-md text-on-surface-variant">Txn Alerts (Manual)</span>
<span className="material-symbols-outlined text-error-rose" style={{ fontSize: '20px' }}>warning</span>
</div>
<div>
<div className="text-headline-lg font-headline-lg text-on-surface">18</div>
<div className="text-body-sm font-body-sm text-success-emerald flex items-center gap-xs mt-1">
<span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_down</span>
<span>-3 from yesterday</span>
</div>
</div>
</div>
{/* Loan Approval Metric */}
<div className="bg-surface-container-lowest p-md rounded-lg border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between h-32 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-shadow">
<div className="flex justify-between items-start">
<span className="text-label-md font-label-md text-on-surface-variant">Loan Approvals</span>
<span className="material-symbols-outlined text-chart-1" style={{ fontSize: '20px' }}>real_estate_agent</span>
</div>
<div>
<div className="text-headline-lg font-headline-lg text-on-surface">156</div>
<div className="text-body-sm font-body-sm text-on-surface-variant mt-1">
<span>SLA: 94% within 24h</span>
</div>
</div>
</div>
{/* Customer Support Metric */}
<div className="bg-surface-container-lowest p-md rounded-lg border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col justify-between h-32 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-shadow">
<div className="flex justify-between items-start">
<span className="text-label-md font-label-md text-on-surface-variant">Active Escalations</span>
<span className="material-symbols-outlined text-chart-2" style={{ fontSize: '20px' }}>support_agent</span>
</div>
<div>
<div className="text-headline-lg font-headline-lg text-on-surface">7</div>
<div className="text-body-sm font-body-sm text-warning-amber mt-1">
<span>3 approaching breach</span>
</div>
</div>
</div>
</div>
{/* Main High-Density Data Grid Area */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
{/* Left Column (Wider for Table) */}
<div className="lg:col-span-2 space-y-gutter">
{/* KYC Review Table */}
<div className="bg-surface-container-lowest rounded-lg border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
<div className="p-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
<h3 className="text-title-md font-title-md text-on-surface flex items-center gap-sm">
<span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>recent_actors</span>
                                Priority KYC Queue
                            </h3>
<button className="text-primary hover:text-on-primary-fixed-variant text-label-md font-label-md">View All</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead className="bg-slate-100 text-label-md font-label-md text-on-surface-variant">
<tr>
<th className="px-md py-sm border-b border-slate-200 font-medium">Customer ID</th>
<th className="px-md py-sm border-b border-slate-200 font-medium">Risk Score</th>
<th className="px-md py-sm border-b border-slate-200 font-medium">Submitted</th>
<th className="px-md py-sm border-b border-slate-200 font-medium">Status</th>
<th className="px-md py-sm border-b border-slate-200 font-medium text-right">Action</th>
</tr>
</thead>
<tbody className="text-body-sm font-body-sm text-on-surface">
<tr className="hover:bg-slate-50 border-b border-slate-200">
<td className="px-md py-unit font-mono-data">CUS-89231</td>
<td className="px-md py-unit text-error-rose font-medium">92 (High)</td>
<td className="px-md py-unit text-on-surface-variant">10m ago</td>
<td className="px-md py-unit"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-warning-amber/10 text-warning-amber">Pending Doc</span></td>
<td className="px-md py-unit text-right"><button className="text-primary hover:underline">Review</button></td>
</tr>
<tr className="hover:bg-slate-50 border-b border-slate-200">
<td className="px-md py-unit font-mono-data">CUS-44102</td>
<td className="px-md py-unit text-warning-amber font-medium">65 (Med)</td>
<td className="px-md py-unit text-on-surface-variant">1h ago</td>
<td className="px-md py-unit"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container-high text-on-surface-variant">In Queue</span></td>
<td className="px-md py-unit text-right"><button className="text-primary hover:underline">Review</button></td>
</tr>
<tr className="hover:bg-slate-50 border-b border-slate-200">
<td className="px-md py-unit font-mono-data">CUS-11904</td>
<td className="px-md py-unit text-success-emerald font-medium">12 (Low)</td>
<td className="px-md py-unit text-on-surface-variant">2h ago</td>
<td className="px-md py-unit"><span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-container-high text-on-surface-variant">In Queue</span></td>
<td className="px-md py-unit text-right"><button className="text-primary hover:underline">Review</button></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
{/* Right Column (Alerts & Actions) */}
<div className="space-y-gutter">
{/* Transaction Alerts */}
<div className="bg-surface-container-lowest rounded-lg border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-full">
<div className="p-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
<h3 className="text-title-md font-title-md text-on-surface flex items-center gap-sm">
<span className="material-symbols-outlined text-error-rose" style={{ fontSize: '20px' }}>warning</span>
                                Flagged Txns
                            </h3>
</div>
<div className="p-md flex-1 overflow-y-auto space-y-md">
{/* Alert Item */}
<div className="p-sm border border-error-container bg-error-container/20 rounded-DEFAULT">
<div className="flex justify-between items-start mb-xs">
<span className="text-label-md font-label-md font-bold text-on-surface">Unusual Transfer Velocity</span>
<span className="text-[10px] text-on-surface-variant">Just now</span>
</div>
<div className="text-body-sm font-body-sm text-on-surface-variant mb-sm">
                                    Acct: <span className="font-mono-data text-on-surface">ACC-9921</span> initiated 5 outbound wires &gt; $10k in 1hr.
                                </div>
<div className="flex gap-sm">
<button className="px-sm py-xs bg-error-rose text-white text-[11px] font-medium rounded-DEFAULT">Freeze Acct</button>
<button className="px-sm py-xs border border-outline-variant text-[11px] font-medium rounded-DEFAULT hover:bg-surface-container">Investigate</button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>

    </>
  );
}
