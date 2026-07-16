export default function LoginLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="min-h-screen bg-[#F8F5F0] flex">
            <div className="hidden lg:flex lg:w-[420px] bg-[#1B2A4F] flex-col justify-between p-10 text-white">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#1B2A4F] text-sm font-bold">R</div>
                        <span className="text-lg font-bold">ReClaim</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold leading-tight">Welcome back.</h2>
                    <p className="text-white/60 text-sm leading-relaxed">Sign in to report lost items, browse found belongings, and reunite with what's yours.</p>
                </div>
                <div className="text-white/30 text-xs">&copy; 2026 ReClaim</div>
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-7 h-7 bg-[#1B2A4F] rounded flex items-center justify-center text-white text-xs font-bold">R</div>
                        <span className="text-base font-bold">ReClaim</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}