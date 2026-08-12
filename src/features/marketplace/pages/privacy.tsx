import { Link } from 'react-router'

/**
 * Trang Chính sách bảo mật — `/privacy`
 * Hiển thị nội dung chính sách bảo mật và thu thập dữ liệu.
 */
export function Component() {
  return (
    <div className="flex flex-col w-full bg-slate-50/30">
      {/* Header */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/80 to-transparent pt-16 pb-12">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop text-center">
          <h1 className="font-display text-slate-900 text-4xl md:text-5xl leading-tight tracking-tight">
            Chính sách bảo mật
          </h1>
          <p className="font-body-md text-slate-500 mt-4">Cập nhật lần cuối: 01/08/2026</p>
        </div>
      </section>

      {/* Nội dung */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-page-padding-mobile md:px-page-padding-desktop">
          <article className="bg-white rounded-2xl border border-slate-100 p-8 md:p-12 shadow-sm prose-container">
            {privacySections.map((section, index) => (
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

/** Nội dung các mục trong Chính sách bảo mật */
const privacySections = [
  {
    title: 'Phạm vi áp dụng',
    paragraphs: [
      'Chính sách bảo mật này áp dụng cho tất cả người dùng truy cập và sử dụng nền tảng RentalSaaS, bao gồm website và các ứng dụng liên quan.',
      'Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn theo quy định pháp luật Việt Nam.',
    ],
  },
  {
    title: 'Thông tin chúng tôi thu thập',
    paragraphs: [
      'Thông tin cá nhân: Họ tên, email, số điện thoại, địa chỉ khi bạn đăng ký tài khoản.',
      'Thông tin sử dụng: Lịch sử tìm kiếm, tương tác trên nền tảng, thiết bị và trình duyệt.',
      'Thông tin giao dịch: Lịch sử thanh toán, gói dịch vụ đã mua (đối với Chủ trọ).',
    ],
  },
  {
    title: 'Mục đích sử dụng thông tin',
    paragraphs: [
      'Cung cấp và cải thiện dịch vụ, cá nhân hoá trải nghiệm người dùng.',
      'Xử lý giao dịch, xác minh danh tính và bảo mật tài khoản.',
      'Gửi thông báo quan trọng về tài khoản, hợp đồng và thay đổi dịch vụ.',
      'Phân tích xu hướng sử dụng để nâng cao chất lượng nền tảng.',
    ],
  },
  {
    title: 'Chia sẻ thông tin',
    paragraphs: [
      'Chúng tôi không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.',
      'Thông tin có thể được chia sẻ với: đối tác cung cấp dịch vụ thanh toán, cơ quan có thẩm quyền khi có yêu cầu pháp lý.',
    ],
  },
  {
    title: 'Bảo mật dữ liệu',
    paragraphs: [
      'Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn ngành bao gồm mã hoá SSL, xác thực hai lớp (OTP) và kiểm soát truy cập nghiêm ngặt.',
      'Dữ liệu nhạy cảm như mật khẩu được mã hoá một chiều (hashed) và không thể đọc ngược.',
    ],
  },
  {
    title: 'Quyền của người dùng',
    paragraphs: [
      'Bạn có quyền truy cập, chỉnh sửa và xoá thông tin cá nhân trong tài khoản của mình.',
      'Bạn có thể yêu cầu xuất dữ liệu cá nhân hoặc xoá tài khoản vĩnh viễn bằng cách liên hệ đội ngũ hỗ trợ.',
    ],
  },
  {
    title: 'Cookie và công nghệ theo dõi',
    paragraphs: [
      'Chúng tôi sử dụng cookie để duy trì phiên đăng nhập và lưu tuỳ chọn người dùng.',
      'Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể bị ảnh hưởng.',
    ],
  },
  {
    title: 'Thay đổi chính sách',
    paragraphs: [
      'RentalSaaS có quyền cập nhật chính sách bảo mật tại bất kỳ thời điểm nào. Mọi thay đổi sẽ được thông báo qua email hoặc thông báo trên nền tảng.',
      'Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ: privacy@rentalsaas.vn.',
    ],
  },
]
