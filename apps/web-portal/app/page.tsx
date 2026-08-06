
export default function Page() {
  return (
    <>
      
{/* TopNavBar Component */}
<header className="bg-surface-container-lowest dark:bg-surface-container-lowest text-primary dark:text-inverse-primary border-b border-outline-variant dark:border-outline-variant docked full-width top-0 z-50 sticky">
<div className="flex justify-between items-center w-full px-margin-desktop h-16 max-w-container-max mx-auto max-w-[1280px]">
{/* Brand */}
<div className="flex items-center gap-4">
<span className="text-title-lg font-title-lg font-bold text-primary dark:text-inverse-primary">BankCore</span>
</div>
{/* Navigation Links */}
<nav className="hidden md:flex items-center gap-8 h-full">
<a className="h-full flex items-center text-primary dark:text-inverse-primary border-b-2 border-secondary font-bold text-label-md font-label-md hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors px-4" href="/loans">Loans Portal</a>
<a className="h-full flex items-center text-on-surface-variant dark:text-on-surface-variant text-label-md font-label-md hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors px-4" href="/accounts">Accounts</a>
<a className="h-full flex items-center text-on-surface-variant dark:text-on-surface-variant text-label-md font-label-md hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors px-4" href="/login">Login</a>
</nav>
{/* Trailing Icons / Actions */}
<div className="flex items-center gap-4">
<button className="p-2 text-on-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container dark:hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center">
<span className="material-symbols-outlined">apps</span>
</button>
<img alt="User profile with role indicator" className="w-8 h-8 rounded-full object-cover border border-outline-variant cursor-pointer ml-2" data-alt="A small, professional user avatar portrait of an executive wearing a modern corporate suit, set against a clean white background with high-key lighting, maintaining a polished, trustworthy fintech visual identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8BWP92E0v6_fygcSBlJ4CiXho6Chf6iMGNTKziEz3hmHs4cLlShEnnWIb0u8pDZEGLStjVFAFDi3gboFUkXt-PoL3HXAixtQ0J2u9rVouUVRROyN18ArPSy0GzroFjZVlWOx5TWOA3mbFBhFDGzgPzBJQitzsEtrYzNb_fQs-V7Cr6jYmB8TwrtlgVMBLXt4uibumgOlczysTdh2pyLFpG_Cd9s8l1X7SytSHB00ZU_-3UvSmyiuhmg"/>
</div>
</div>
</header>
<main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
{/* Hero Section */}
<section className="flex flex-col lg:flex-row items-center gap-xl mb-2xl pt-lg">
<div className="w-full lg:w-1/2 flex flex-col gap-lg">
<h1 className="text-display-lg font-display-lg text-on-surface">Global Liquidity at Enterprise Scale</h1>
<p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
                    Secure, instantaneous capital movement across borders. BankCore provides the robust infrastructure required for high-volume transactions, advanced treasury management, and seamless API integration for Fortune 500 financial operations.
                </p>
<div className="flex items-center gap-md pt-sm">
<a href="/accounts" className="bg-primary text-on-primary px-xl py-unit rounded-lg text-title-md font-title-md hover:bg-primary-container transition-colors shadow-sm text-center inline-block">
                        Open Account
                    </a>
<a href="/loans" className="bg-surface-container-lowest text-primary border border-outline-variant px-xl py-unit rounded-lg text-title-md font-title-md hover:bg-surface-container transition-colors shadow-sm text-center inline-block">
                        Apply for Loan
                    </a>
</div>
</div>
<div className="w-full lg:w-1/2 h-64 md:h-96 rounded-xl overflow-hidden shadow-sm border border-outline-variant relative bg-surface-container-lowest">
<div className="bg-cover bg-center w-full h-full absolute inset-0" data-alt="An abstract, modern digital visualization of global liquidity and financial networks. The scene features a sleek, high-tech map or node network constructed from sharp, glowing blue and indigo lines against a pristine, light grey-white corporate background. Subtle depth of field and soft ambient shadows emphasize precision and enterprise-grade reliability." style={{ backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuBRZfaLPr2G7y35xjkKuc9qK4eSH2zb1NBI-JZ101irB-0qq5cNmHYq749poLd_07vMJGxagC5teDcmc-e12tNUPu5t0GeLNvGklAJB5iukAiBSN3yP2vt_gl7vVTZe8RcQk1rUQ59c7sZiL-GQRJwPOxao8W4EctIIW3Fuk2bCGIPxBYClTgPG7BysvHMHiYe4pNAKX0OLDZ93K1A6y8G9B49m-CuLnOPsxhb0mxvoh9GT27gqimYAfA\')' }}></div>
<div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
<div>
<p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">Current Liquidity Pool</p>
<p className="text-headline-md font-headline-md text-on-surface font-mono-data">$48.2B</p>
</div>
<div className="flex items-center gap-2 text-success-emerald">
<span className="material-symbols-outlined text-sm">trending_up</span>
<span className="text-body-md font-body-md font-semibold">+2.4%</span>
</div>
</div>
</div>
</section>
{/* Feature Grid */}
<section className="mb-2xl pt-xl border-t border-slate-200">
<h2 className="text-headline-lg font-headline-lg text-on-surface mb-xl text-center">Infrastructure for Modern Finance</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
{/* Feature 1 */}
<div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-shadow">
<div className="w-12 h-12 rounded-lg bg-surface-container-low text-primary flex items-center justify-center mb-md border border-slate-200">
<span className="material-symbols-outlined">shield_lock</span>
</div>
<h3 className="text-title-lg font-title-lg text-on-surface mb-sm">Military-Grade Security</h3>
<p className="text-body-md font-body-md text-on-surface-variant">
                        End-to-end encryption, real-time fraud monitoring, and multi-factor authentication protocols standard across all tiers.
                    </p>
</div>
{/* Feature 2 */}
<div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-shadow">
<div className="w-12 h-12 rounded-lg bg-surface-container-low text-primary flex items-center justify-center mb-md border border-slate-200">
<span className="material-symbols-outlined">api</span>
</div>
<h3 className="text-title-lg font-title-lg text-on-surface mb-sm">RESTful Core API</h3>
<p className="text-body-md font-body-md text-on-surface-variant">
                        Programmatic access to accounts, transfers, and real-time ledger data with 99.999% guaranteed uptime SLA.
                    </p>
</div>
{/* Feature 3 */}
<div className="bg-surface-container-lowest p-lg rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-shadow">
<div className="w-12 h-12 rounded-lg bg-surface-container-low text-primary flex items-center justify-center mb-md border border-slate-200">
<span className="material-symbols-outlined">swap_horiz</span>
</div>
<h3 className="text-title-lg font-title-lg text-on-surface mb-sm">Instantaneous Transfers</h3>
<p className="text-body-md font-body-md text-on-surface-variant">
                        Settle cross-border payments in milliseconds using our proprietary decentralized settlement network.
                    </p>
</div>
</div>
</section>
{/* Pricing / Tier Section */}
<section className="mb-2xl pt-xl border-t border-slate-200">
<div className="text-center mb-xl">
<h2 className="text-headline-lg font-headline-lg text-on-surface mb-unit">Transparent Tiering</h2>
<p className="text-body-lg font-body-lg text-on-surface-variant">Select the operational scale that matches your institution.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-lg max-w-5xl mx-auto">
{/* Personal/Starter Tier */}
<div className="bg-surface-container-lowest p-xl rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col">
<div className="mb-lg">
<h3 className="text-title-lg font-title-lg text-on-surface mb-xs">Starter</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-md">For small business and startups.</p>
<div className="flex items-baseline gap-1">
<span className="text-headline-lg font-headline-lg text-on-surface">$49</span>
<span className="text-body-md font-body-md text-on-surface-variant">/mo</span>
</div>
</div>
<ul className="flex flex-col gap-unit mb-lg flex-grow">
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Up to 5,000 transactions/mo
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Standard API Access
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Domestic Transfers Only
                        </li>
</ul>
<button className="w-full bg-surface-container-lowest text-primary border border-outline-variant px-md py-unit rounded-lg text-title-md font-title-md hover:bg-surface-container transition-colors">
                        Select Starter
                    </button>
</div>
{/* Premium Tier */}
<div className="bg-surface-container-lowest p-xl rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.07)] border-2 border-primary relative flex flex-col transform md:-translate-y-4">
<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary px-sm py-xs rounded-full text-label-md font-label-md uppercase tracking-wider">
                        Most Popular
                    </div>
<div className="mb-lg mt-sm">
<h3 className="text-title-lg font-title-lg text-on-surface mb-xs">Premium</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-md">For scaling financial operations.</p>
<div className="flex items-baseline gap-1">
<span className="text-headline-lg font-headline-lg text-on-surface">$299</span>
<span className="text-body-md font-body-md text-on-surface-variant">/mo</span>
</div>
</div>
<ul className="flex flex-col gap-unit mb-lg flex-grow">
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Up to 100,000 transactions/mo
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Advanced API &amp; Webhooks
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            International Settlements
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Priority Support
                        </li>
</ul>
<button className="w-full bg-primary text-on-primary px-md py-unit rounded-lg text-title-md font-title-md hover:bg-primary-container transition-colors">
                        Select Premium
                    </button>
</div>
{/* Enterprise Tier */}
<div className="bg-surface-container-lowest p-xl rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col">
<div className="mb-lg">
<h3 className="text-title-lg font-title-lg text-on-surface mb-xs">Enterprise</h3>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-md">Custom solutions for Fortune 500.</p>
<div className="flex items-baseline gap-1">
<span className="text-headline-lg font-headline-lg text-on-surface">Custom</span>
</div>
</div>
<ul className="flex flex-col gap-unit mb-lg flex-grow">
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Unlimited Transactions
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            Dedicated Infrastructure
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            White-label Options
                        </li>
<li className="flex items-center gap-sm text-body-sm font-body-sm text-on-surface">
<span className="material-symbols-outlined text-success-emerald text-[18px]">check</span>
                            24/7 Dedicated Account Manager
                        </li>
</ul>
<button className="w-full bg-surface-container-lowest text-primary border border-outline-variant px-md py-unit rounded-lg text-title-md font-title-md hover:bg-surface-container transition-colors">
                        Contact Sales
                    </button>
</div>
</div>
</section>
</main>
<footer className="bg-surface-container text-on-surface py-xl border-t border-slate-200 mt-auto">
<div className="max-w-[1280px] mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md">
<div className="flex items-center gap-4">
<span className="text-title-md font-title-md font-bold text-primary">BankCore</span>
<span className="text-body-sm font-body-sm text-on-surface-variant">© 2024 BankCore Financial. All rights reserved.</span>
</div>
<div className="flex gap-lg text-body-sm font-body-sm text-on-surface-variant">
<a className="hover:text-primary transition-colors" href="#">Privacy</a>
<a className="hover:text-primary transition-colors" href="#">Terms</a>
<a className="hover:text-primary transition-colors" href="#">Security</a>
</div>
</div>
</footer>

    </>
  );
}
