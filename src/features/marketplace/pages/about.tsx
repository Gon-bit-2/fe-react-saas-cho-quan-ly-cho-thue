import { Link } from 'react-router'

/**
 * Trang Giới thiệu — `/gioi-thieu`
 * Trình bày tầm nhìn, sứ mệnh và các giá trị cốt lõi của nền tảng RentalSaaS.
 */
export function Component() {
  return (
    <div className="flex flex-col w-full bg-slate-50/30">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/80 to-transparent pt-16 pb-20">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop text-center">
          <span className="font-label-sm text-primary uppercase tracking-widest font-semibold">
            Về chúng tôi
          </span>
          <h1 className="font-display text-slate-900 text-4xl md:text-5xl leading-tight tracking-tight mt-4">
            Nền tảng cho thuê bất động sản{' '}
            <span className="text-primary italic font-serif">thế hệ mới</span>
          </h1>
          <p className="font-body-md text-slate-600 max-w-2xl mx-auto text-lg mt-6">
            RentalSaaS được xây dựng với sứ mệnh số hoá và minh bạch hoá quy trình thuê &amp; cho
            thuê nhà, giúp cả chủ trọ và người thuê có trải nghiệm tốt nhất.
          </p>
        </div>
      </section>

      {/* Tầm nhìn & Sứ mệnh */}
      <section className="py-16">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[28px]">visibility</span>
            </div>
            <h2 className="font-display text-slate-900 text-2xl mb-4">Tầm nhìn</h2>
            <p className="font-body-md text-slate-600 leading-relaxed">
              Trở thành nền tảng quản lý cho thuê bất động sản hàng đầu Việt Nam, kết nối chủ trọ
              và người thuê một cách nhanh chóng, an toàn và minh bạch.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[28px]">rocket_launch</span>
            </div>
            <h2 className="font-display text-slate-900 text-2xl mb-4">Sứ mệnh</h2>
            <p className="font-body-md text-slate-600 leading-relaxed">
              Cung cấp giải pháp công nghệ toàn diện giúp chủ trọ quản lý hiệu quả, người thuê tìm
              kiếm dễ dàng, và mọi giao dịch đều được bảo vệ.
            </p>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop">
          <div className="text-center mb-12">
            <h2 className="font-display text-slate-900 text-3xl">Giá trị cốt lõi</h2>
            <p className="font-body-md text-slate-500 mt-3">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((item) => (
              <div
                key={item.title}
                className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                </div>
                <h3 className="font-label-md text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="font-body-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-transparent to-blue-50/50">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop text-center">
          <h2 className="font-display text-slate-900 text-3xl mb-4">
            Bắt đầu trải nghiệm ngay hôm nay
          </h2>
          <p className="font-body-md text-slate-500 max-w-lg mx-auto mb-8">
            Đăng ký miễn phí và khám phá hàng ngàn phòng cho thuê chất lượng trên khắp Việt Nam.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/phong"
              className="px-6 py-3 bg-primary text-on-primary font-label-md rounded-xl shadow-md hover:bg-primary/90 transition-colors"
            >
              Tìm phòng ngay
            </Link>
            <Link
              to="/dang-ky"
              className="px-6 py-3 border border-slate-200 text-slate-700 font-label-md rounded-xl hover:bg-slate-50 transition-colors"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Dữ liệu giá trị cốt lõi hiển thị trên trang */
const coreValues = [
  {
    icon: 'verified_user',
    title: 'An toàn',
    description: 'Mọi giao dịch được bảo vệ và xác minh rõ ràng.',
  },
  {
    icon: 'speed',
    title: 'Nhanh chóng',
    description: 'Quy trình tối ưu, từ tìm kiếm đến ký hợp đồng chỉ trong vài phút.',
  },
  {
    icon: 'handshake',
    title: 'Minh bạch',
    description: 'Thông tin giá cả, điều khoản và đánh giá hoàn toàn công khai.',
  },
  {
    icon: 'support_agent',
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn.',
  },
]
