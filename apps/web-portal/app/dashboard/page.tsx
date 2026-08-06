
export default function Page() {
  return (
    <>
      
{/* TopNavBar */}
<header className="bg-surface-container-lowest dark:bg-surface-container-lowest border-b border-outline-variant dark:border-outline-variant sticky top-0 z-50">
<div className="flex justify-between items-center w-full px-margin-desktop h-16 max-w-7xl mx-auto">
<div className="flex items-center gap-xl">
{/* Brand */}
<div className="text-title-lg font-title-lg font-bold text-primary dark:text-inverse-primary tracking-tight">
                    BankCore
                </div>
{/* Nav Links (Desktop) */}
<nav className="hidden md:flex items-center gap-md h-full">
<a className="h-16 flex items-center px-md text-primary dark:text-inverse-primary border-b-2 border-secondary font-bold hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors opacity-80 transition-all duration-100" href="#">
<span className="text-label-md font-label-md">Customer</span>
</a>
<a className="h-16 flex items-center px-md text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors" href="#">
<span className="text-label-md font-label-md">Employee</span>
</a>
<a className="h-16 flex items-center px-md text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors" href="#">
<span className="text-label-md font-label-md">Admin</span>
</a>
</nav>
</div>
{/* Trailing Actions & Profile */}
<div className="flex items-center gap-md">
{/* Search (on_left logic implemented by layout order, though minimal here) */}
<div className="hidden md:flex relative">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '18px' }}>search</span>
<input className="pl-xl pr-md py-sm rounded bg-surface-container-low border-slate-200 text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all" placeholder="Search..." type="text"/>
</div>
<button className="p-sm text-on-surface-variant hover:bg-surface-container rounded-full transition-colors flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="p-sm text-on-surface-variant hover:bg-surface-container rounded-full transition-colors flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="apps">apps</span>
</button>
<div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-sm cursor-pointer">
<img alt="User profile with role indicator" className="w-full h-full object-cover" data-alt="A professional corporate headshot of a mature individual in a modern, brightly lit office environment. The lighting is crisp and natural, highlighting a confident expression. The background features subtle, out-of-focus architectural elements in shades of cool slate and glass. The overall mood conveys trust and financial expertise." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8wOrcnhq4nMUPb08TSFTt6FopyTv6-1nt699dDkLTi4NonJj4_sGPReIYg8V_wDMP_2jJczEXahpKGuVWW9JKJ6yKpk5w6r34nH_X3cq4boJNQt7P1exJjdoAjgxbOKVJZ4LCHSo2IsJ87Ahfu6WYEn2FNhXeafYNPdH-1D7QfP6Qnn44elblQuD5_-38TTKkS6pxTekoLLZc432qXzVwdbwaSF6ttQRU8cePh5ZCoTBbdvjTQZPxNw"/>
</div>
</div>
</div>
</header>
{/* Main Content Area (Centered Fixed-Width) */}
<main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl md:py-2xl flex flex-col gap-2xl">
{/* Header Section */}
<section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
<div>
<h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-slate-900 tracking-tight">Customer Overview</h1>
<p className="text-body-md font-body-md text-slate-500 mt-xs">Welcome back. Here is your portfolio summary as of today.</p>
</div>
<div className="flex gap-sm w-full md:w-auto">
<button className="flex-1 md:flex-none flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary rounded text-label-md font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-ambient-lvl1">
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                    Wire Transfer
                </button>
<button className="flex-1 md:flex-none flex items-center justify-center gap-xs px-md py-sm bg-surface-container text-on-surface rounded text-label-md font-label-md border border-slate-200 hover:bg-surface-container-high transition-colors shadow-ambient-lvl1">
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
                    Pay Bill
                </button>
</div>
</section>
{/* Bento Grid Layout */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/* Total Liquidity Card (Spans 4 columns on desktop) */}
<div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-lg border border-slate-200 shadow-ambient-lvl1 p-lg flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-ambient-lvl2 transition-shadow">
{/* Subtle Gradient Background for Premium Feel */}
<div className="absolute inset-0 bg-gradient-to-br from-primary-fixed to-transparent opacity-30 z-0"></div>
<div className="relative z-10 flex flex-col h-full justify-between">
<div>
<div className="flex justify-between items-center mb-md">
<h2 className="text-title-md font-title-md text-slate-800">Total Liquidity</h2>
<span className="material-symbols-outlined text-tertiary">account_balance_wallet</span>
</div>
<div className="text-display-lg font-display-lg text-slate-900 tracking-tighter">
                            $1,248,500<span className="text-title-lg font-title-lg text-slate-400">.00</span>
</div>
<div className="flex items-center gap-xs mt-sm text-success-emerald">
<span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: '\'FILL\' 1' }}>trending_up</span>
<span className="text-label-md font-label-md">+2.4% vs last month</span>
</div>
</div>
<div className="mt-xl flex flex-col gap-sm">
<div className="flex justify-between items-center border-b border-slate-100 pb-sm">
<span className="text-body-sm font-body-sm text-slate-500">Checking (···4921)</span>
<span className="text-mono-data font-mono-data text-slate-800">$124,500.00</span>
</div>
<div className="flex justify-between items-center border-b border-slate-100 pb-sm">
<span className="text-body-sm font-body-sm text-slate-500">Savings (···8832)</span>
<span className="text-mono-data font-mono-data text-slate-800">$450,000.00</span>
</div>
<div className="flex justify-between items-center">
<span className="text-body-sm font-body-sm text-slate-500">Investments</span>
<span className="text-mono-data font-mono-data text-slate-800">$674,000.00</span>
</div>
</div>
</div>
</div>
{/* Cash Flow Chart Area (Spans 8 columns on desktop) */}
<div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-lg border border-slate-200 shadow-ambient-lvl1 p-lg flex flex-col">
<div className="flex justify-between items-center mb-lg">
<h2 className="text-title-md font-title-md text-slate-800">Cash Flow (6 Months)</h2>
<div className="flex gap-sm">
<div className="flex items-center gap-xs">
<div className="w-3 h-3 rounded-full bg-chart-1"></div>
<span className="text-label-md font-label-md text-slate-600">Income</span>
</div>
<div className="flex items-center gap-xs">
<div className="w-3 h-3 rounded-full bg-chart-4"></div>
<span className="text-label-md font-label-md text-slate-600">Expenses</span>
</div>
</div>
</div>
{/* Mock Chart Visualization */}
<div className="flex-grow flex items-end justify-between relative pt-xl w-full" style={{ minHeight: '200px' }}>
{/* Y-Axis Grid Lines */}
<div className="absolute inset-0 flex flex-col justify-between pb-lg z-0 pointer-events-none">
<div className="border-b border-dashed border-slate-200 w-full h-0"></div>
<div className="border-b border-dashed border-slate-200 w-full h-0"></div>
<div className="border-b border-dashed border-slate-200 w-full h-0"></div>
<div className="border-b border-solid border-slate-200 w-full h-0"></div>
</div>
{/* Bars (Months) */}
<div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-lg gap-sm group">
<div className="flex items-end gap-xs h-full w-12 justify-center">
<div className="w-3 bg-chart-1 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '40%' }}></div>
<div className="w-3 bg-chart-4 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '30%' }}></div>
</div>
<span className="text-label-md font-label-md text-slate-500 absolute bottom-0">Jan</span>
</div>
<div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-lg gap-sm group">
<div className="flex items-end gap-xs h-full w-12 justify-center">
<div className="w-3 bg-chart-1 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '55%' }}></div>
<div className="w-3 bg-chart-4 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '45%' }}></div>
</div>
<span className="text-label-md font-label-md text-slate-500 absolute bottom-0">Feb</span>
</div>
<div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-lg gap-sm group">
<div className="flex items-end gap-xs h-full w-12 justify-center">
<div className="w-3 bg-chart-1 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '80%' }}></div>
<div className="w-3 bg-chart-4 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '35%' }}></div>
</div>
<span className="text-label-md font-label-md text-slate-500 absolute bottom-0">Mar</span>
</div>
<div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-lg gap-sm group">
<div className="flex items-end gap-xs h-full w-12 justify-center">
<div className="w-3 bg-chart-1 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '65%' }}></div>
<div className="w-3 bg-chart-4 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '60%' }}></div>
</div>
<span className="text-label-md font-label-md text-slate-500 absolute bottom-0">Apr</span>
</div>
<div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-lg gap-sm group">
<div className="flex items-end gap-xs h-full w-12 justify-center">
<div className="w-3 bg-chart-1 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '90%' }}></div>
<div className="w-3 bg-chart-4 rounded-t opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: '40%' }}></div>
</div>
<span className="text-label-md font-label-md text-slate-500 absolute bottom-0">May</span>
</div>
<div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-lg gap-sm group">
<div className="flex items-end gap-xs h-full w-12 justify-center">
{/* Current Month Highlight */}
<div className="w-3 bg-chart-1 rounded-t shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ height: '75%' }}></div>
<div className="w-3 bg-chart-4 rounded-t shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{ height: '50%' }}></div>
</div>
<span className="text-label-md font-label-md text-primary font-bold absolute bottom-0">Jun</span>
</div>
</div>
</div>
{/* Recent Transactions Table (Spans full width) */}
<div className="col-span-1 md:col-span-12 bg-surface-container-lowest rounded-lg border border-slate-200 shadow-ambient-lvl1 overflow-hidden">
<div className="p-md md:p-lg border-b border-slate-200 flex justify-between items-center bg-slate-50">
<h2 className="text-title-md font-title-md text-slate-800">Recent Transactions</h2>
<button className="text-label-md font-label-md text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-xs">
                        View All <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
</button>
</div>
<div className="overflow-x-auto w-full">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-slate-100 border-b border-slate-200 text-label-md font-label-md text-slate-500 uppercase tracking-wider">
<th className="p-sm pl-lg font-medium w-1/4">Date &amp; Time</th>
<th className="p-sm font-medium w-1/3">Description</th>
<th className="p-sm font-medium w-1/6">Category</th>
<th className="p-sm font-medium w-1/6 text-right">Amount</th>
<th className="p-sm pr-lg font-medium w-12 text-center">Status</th>
</tr>
</thead>
<tbody className="text-body-sm font-body-sm text-slate-700 divide-y divide-slate-100">
<tr className="hover:bg-slate-50 transition-colors h-[48px] group">
<td className="p-sm pl-lg text-slate-500">Oct 24, 09:12 AM</td>
<td className="p-sm font-medium text-slate-900 flex items-center gap-sm">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>storefront</span>
</div>
                                    Acme Corp Supply
                                </td>
<td className="p-sm text-slate-500">B2B Vendor</td>
<td className="p-sm text-right text-mono-data font-mono-data text-slate-900">-$4,250.00</td>
<td className="p-sm pr-lg flex justify-center items-center h-full">
<div className="w-2 h-2 rounded-full bg-success-emerald mt-[18px]" title="Completed"></div>
</td>
</tr>
<tr className="hover:bg-slate-50 transition-colors h-[48px] group">
<td className="p-sm pl-lg text-slate-500">Oct 23, 14:45 PM</td>
<td className="p-sm font-medium text-slate-900 flex items-center gap-sm">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
</div>
                                    Inbound Wire - Zenith LLC
                                </td>
<td className="p-sm text-slate-500">Transfer</td>
<td className="p-sm text-right text-mono-data font-mono-data text-success-emerald">+$15,000.00</td>
<td className="p-sm pr-lg flex justify-center items-center h-full">
<div className="w-2 h-2 rounded-full bg-success-emerald mt-[18px]" title="Completed"></div>
</td>
</tr>
<tr className="hover:bg-slate-50 transition-colors h-[48px] group">
<td className="p-sm pl-lg text-slate-500">Oct 21, 11:00 AM</td>
<td className="p-sm font-medium text-slate-900 flex items-center gap-sm">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>flight</span>
</div>
                                    Delta Airlines Corporate
                                </td>
<td className="p-sm text-slate-500">Travel</td>
<td className="p-sm text-right text-mono-data font-mono-data text-slate-900">-$1,245.50</td>
<td className="p-sm pr-lg flex justify-center items-center h-full">
<div className="w-2 h-2 rounded-full bg-warning-amber mt-[18px]" title="Pending"></div>
</td>
</tr>
<tr className="hover:bg-slate-50 transition-colors h-[48px] group">
<td className="p-sm pl-lg text-slate-500">Oct 20, 08:30 AM</td>
<td className="p-sm font-medium text-slate-900 flex items-center gap-sm">
<div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>devices</span>
</div>
                                    AWS Cloud Services
                                </td>
<td className="p-sm text-slate-500">Infrastructure</td>
<td className="p-sm text-right text-mono-data font-mono-data text-slate-900">-$3,490.20</td>
<td className="p-sm pr-lg flex justify-center items-center h-full">
<div className="w-2 h-2 rounded-full bg-success-emerald mt-[18px]" title="Completed"></div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</main>

    </>
  );
}
