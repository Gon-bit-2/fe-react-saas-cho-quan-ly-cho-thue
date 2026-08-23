export function MarketStatsCard() {
  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 h-full flex flex-col justify-between border border-slate-200/50 shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md">
      <div className="relative z-10">
        <p className="text-on-surface-variant font-body-sm mb-1">Thống kê thị trường</p>
        <p className="font-display text-4xl text-primary font-bold flex items-end gap-2 tracking-tight">
          4.2M <span className="font-body-sm font-normal text-on-surface-variant tracking-normal mb-1">Giá trung bình/tháng</span>
        </p>
      </div>

      <div className="relative z-10 w-full mt-8 h-24 flex items-end">
        <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-primary" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M 0,40 Q 20,30 40,40 T 80,50 T 120,20 T 160,40 T 200,30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="text-primary"
            filter="url(#glow)"
          />
          <path
            d="M 0,40 Q 20,30 40,40 T 80,50 T 120,20 T 160,40 T 200,30 L 200,60 L 0,60 Z"
            fill="url(#chartGradient)"
          />
          {/* Vertical axis lines */}
          <line x1="0" y1="0" x2="0" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="200" y1="0" x2="200" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>
      
      <div className="relative z-10 flex justify-between mt-2 font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
        <span>Tháng 1</span>
        <span>Hiện tại</span>
      </div>
    </div>
  )
}
