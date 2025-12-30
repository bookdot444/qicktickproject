import UserHeader from '@/components/user/Header'
import Footer from '@/components/user/Footer'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserHeader />
      {/* Remove default spacing */}
      <main className="min-h-screen pt-0">
        {children}
      </main>
      <Footer />
    </>
  )
}
