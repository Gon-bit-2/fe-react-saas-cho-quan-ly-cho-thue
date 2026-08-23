import { Link } from 'react-router'

/**
 * Trang Điều khoản dịch vụ — `/terms`
 * Hiển thị nội dung điều khoản dịch vụ dạng văn bản dài.
 */
export function Component() {
  return (
    <div className="flex flex-col w-full bg-slate-50/30">
      {/* Header */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/80 to-transparent pt-16 pb-12">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop text-center">
          <h1 className="font-display text-slate-900 text-4xl md:text-5xl leading-tight tracking-tight">
            Điều khoản dịch vụ
          </h1>
          <p className="font-body-md text-slate-500 mt-4">Cập nhật lần cuối: 01/08/2026</p>
        </div>
      </section>

      {/* Nội dung */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-page-padding-mobile md:px-page-padding-desktop">
          <article className="bg-white rounded-2xl border border-slate-100 p-8 md:p-12 shadow-sm prose-container">
            {termsSections.map((section, index) => (
              <div key={index} className={index > 0 ? 'mt-10' : ''}>
                <h2 className="font-display text-slate-900 text-xl mb-4">
                  {index + 1}. {section.title}
                </h2>
                <div className="font-body-md text-slate-600 leading-relaxed space-y-3">
                  {section.paragraphs.map((p, pIndex) => (
                    <p key={pIndex}>{p}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Quay về */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <Link
                to="/"
                className="text-primary font-label-md hover:underline inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Quay về trang chủ
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}

/** Nội dung các mục trong Điều khoản dịch vụ */
const termsSections = [
  {
    title: 'Giới thiệu',
    paragraphs: [
      'Chào mừng bạn đến với RentalSaaS. Bằng việc truy cập và sử dụng nền tảng này, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định dưới đây.',
      'Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng không sử dụng nền tảng.',
    ],
  },
  {
    title: 'Định nghĩa',
    paragraphs: [
      '"Nền tảng" là website và các ứng dụng liên quan của RentalSaaS.',
      '"Người dùng" bao gồm Chủ trọ (Landlord) và Người thuê (Renter) sử dụng nền tảng.',
      '"Dịch vụ" là tất cả các tính năng, công cụ và tiện ích mà RentalSaaS cung cấp.',
    ],
  },
  {
    title: 'Tài khoản người dùng',
    paragraphs: [
      'Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký tài khoản. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình.',
      'RentalSaaS có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản sử dụng mà không cần thông báo trước.',
    ],
  },
  {
    title: 'Quyền và nghĩa vụ của Chủ trọ',
    paragraphs: [
      'Chủ trọ cam kết cung cấp thông tin chính xác về phòng cho thuê bao gồm: hình ảnh thực tế, giá cả, tiện ích và điều kiện thuê.',
      'Chủ trọ có trách nhiệm phản hồi yêu cầu thuê và lịch xem phòng trong thời gian hợp lý.',
      'Nghiêm cấm đăng tin sai lệch, gian lận hoặc vi phạm pháp luật.',
    ],
  },
  {
    title: 'Quyền và nghĩa vụ của Người thuê',
    paragraphs: [
      'Người thuê có quyền tìm kiếm, so sánh và gửi yêu cầu thuê phòng trên nền tảng.',
      'Người thuê cam kết không lạm dụng hệ thống, không gửi yêu cầu spam, và tuân thủ các quy định về đánh giá và phản hồi.',
    ],
  },
  {
    title: 'Thanh toán và phí dịch vụ',
    paragraphs: [
      'Các gói dịch vụ SaaS dành cho Chủ trọ được thanh toán theo chu kỳ tháng hoặc năm. Chi tiết phí được công bố tại mục Gói dịch vụ.',
      'RentalSaaS không thu phí trung gian từ giao dịch thuê phòng giữa Chủ trọ và Người thuê.',
    ],
  },
  {
    title: 'Giới hạn trách nhiệm',
    paragraphs: [
      'RentalSaaS là nền tảng kết nối và không chịu trách nhiệm về các tranh chấp phát sinh trực tiếp giữa Chủ trọ và Người thuê.',
      'Chúng tôi nỗ lực duy trì dịch vụ ổn định nhưng không đảm bảo nền tảng luôn hoạt động liên tục, không có lỗi.',
    ],
  },
  {
    title: 'Thay đổi điều khoản',
    paragraphs: [
      'RentalSaaS có quyền cập nhật điều khoản dịch vụ tại bất kỳ thời điểm nào. Thay đổi sẽ có hiệu lực ngay khi được đăng tải trên nền tảng.',
      'Việc tiếp tục sử dụng dịch vụ sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi.',
    ],
  },
]
