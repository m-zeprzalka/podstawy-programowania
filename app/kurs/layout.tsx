import { SiteFooter } from "@/components/kurs/site-footer"
import { SiteHeader } from "@/components/kurs/site-header"

export default function KursLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader variant="kurs" />
      {children}
      <SiteFooter className="pb-16 lg:pb-0" />
    </>
  )
}
