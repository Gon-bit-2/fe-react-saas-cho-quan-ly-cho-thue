import { useState } from 'react'
import { Link } from 'react-router'

/**
 * Trang Trung tâm trợ giúp — `/help`
 * Hiển thị FAQ dạng accordion và thông tin liên hệ hỗ trợ.
 */
export function Component() {
  return (
    <div className="flex flex-col w-full bg-slate-50/30">
      {/* Header */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/80 to-transparent pt-16 pb-16">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop text-center">
          <span className="font-label-sm text-primary uppercase tracking-widest font-semibold">
            Hỗ trợ
          </span>
          <h1 className="font-display text-slate-900 text-4xl md:text-5xl leading-tight tracking-tight mt-4">
            Trung tâm trợ giúp
          </h1>
          <p className="font-body-md text-slate-600 max-w-2xl mx-auto text-lg mt-6">
            Tìm câu trả lời nhanh cho các thắc mắc phổ biến hoặc liên hệ đội ngũ hỗ trợ.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-page-padding-mobile md:px-page-padding-desktop">
          <h2 className="font-display text-slate-900 text-2xl mb-8">Câu hỏi thường gặp</h2>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <FaqAccordion key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Liên hệ */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-[1440px] px-page-padding-mobile md:px-page-padding-desktop">
          <div className="text-center mb-12">
            <h2 className="font-display text-slate-900 text-2xl">Vẫn cần hỗ trợ?</h2>
            <p className="font-body-md text-slate-500 mt-3">
              Liên hệ với chúng tôi qua các kênh dưới đây
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {contactChannels.map((ch) => (
              <div
                key={ch.title}
                className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[24px]">{ch.icon}</span>
                </div>
                <h3 className="font-label-md text-slate-900 mb-1">{ch.title}</h3>
                <p className="font-body-sm text-slate-500">{ch.detail}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/"
              className="text-primary font-label-md hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * Component accordion đơn cho một câu hỏi FAQ.
 * Sử dụng state open/close để toggle hiển thị câu trả lời.
 */
function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-label-md text-slate-900 pr-4">{question}</span>
        <span
          className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <p className="font-body-md text-slate-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

/** Danh sách câu hỏi thường gặp */
const faqItems = [
  {
    question: 'Làm thế nào để đăng ký tài khoản?',
    answer:
      'Bạn có thể đăng ký tài khoản bằng cách nhấn nút "Đăng ký" ở góc trên phải trang web, sau đó điền thông tin email và mật khẩu. Bạn cũng có thể đăng nhập nhanh bằng tài khoản Google.',
  },
  {
    question: 'Tôi muốn đăng phòng cho thuê thì làm sao?',
    answer:
      'Sau khi đăng ký tài khoản với vai trò Chủ trọ, bạn tạo một đơn vị kinh doanh (nhà trọ), thêm khu trọ và phòng. Phòng sẽ được kiểm duyệt trước khi hiển thị trên Marketplace.',
  },
  {
    question: 'Phí sử dụng nền tảng là bao nhiêu?',
    answer:
      'RentalSaaS cung cấp gói miễn phí cho chủ trọ nhỏ. Các gói nâng cao với nhiều tính năng quản lý hơn có mức phí hợp lý, bạn có thể xem chi tiết tại mục Gói dịch vụ.',
  },
  {
    question: 'Làm sao để gửi yêu cầu thuê phòng?',
    answer:
      'Khi tìm thấy phòng phù hợp trên Marketplace, bạn nhấn "Gửi yêu cầu thuê" trên trang chi tiết phòng. Chủ trọ sẽ nhận được thông báo và phản hồi yêu cầu của bạn.',
  },
  {
    question: 'Tôi có thể đặt lịch xem phòng trực tiếp không?',
    answer:
      'Có, bạn có thể đặt lịch xem phòng trực tiếp thông qua tính năng "Đặt lịch xem" trên trang chi tiết phòng. Chủ trọ sẽ xác nhận lịch hẹn với bạn.',
  },
  {
    question: 'Làm sao để liên hệ hỗ trợ khi gặp sự cố?',
    answer:
      'Bạn có thể gửi email đến support@rentalsaas.vn hoặc gọi hotline 1900-xxxx. Nếu đã đăng nhập, bạn có thể tạo ticket hỗ trợ trực tiếp trong hệ thống.',
  },
]

/** Các kênh liên hệ hỗ trợ */
const contactChannels = [
  { icon: 'mail', title: 'Email', detail: 'support@rentalsaas.vn' },
  { icon: 'call', title: 'Hotline', detail: '1900-xxxx (8h - 22h)' },
  { icon: 'chat', title: 'Live Chat', detail: 'Chat trực tiếp trên web' },
]
