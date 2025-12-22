import UserHeader from '@/components/user/Header'
import Footer from '@/components/user/Footer'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserHeader />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
