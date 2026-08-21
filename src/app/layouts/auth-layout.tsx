import { Outlet } from 'react-router'
import { Link } from 'react-router'

export function Component() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-page-padding-mobile md:p-page-padding-desktop relative z-0">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-fixed/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary-fixed/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="mb-gap-sections flex flex-col items-center">
        <Link to="/">
          <img
            alt="Nhà Trọ Việt Logo"
            className="h-12 w-auto object-contain mb-4"
            src="/logo.png"
          />
        </Link>
        <h1 className="font-headline-md text-headline-md text-on-surface">
          Hệ thống Quản lý cho thuê phòng
        </h1>
      </div>

      {/* Content */}
      <section className="w-full max-w-auth-card-width relative z-10">
        <div className="flex flex-col w-full items-center justify-center min-h-[calc(100vh-200px)]">
          <Outlet />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-gap-sections text-center">
        <p className="font-label-md text-label-md text-on-surface-variant">
          © 2026 Bản quyền thuộc về gondev. Mọi quyền được bảo lưu.
        </p>
      </footer>
    </main>
  )
}
