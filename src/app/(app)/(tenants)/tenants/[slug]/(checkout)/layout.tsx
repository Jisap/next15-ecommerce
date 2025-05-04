
import { Navbar } from "@/modules/checkout/ui/components/navbar";
import { Footer } from "@/modules/tenants/ui/components/footer";






interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;  // Se reciben los params de la ruta de la URL [slug]

}

const Layout = async ({ children, params }: LayoutProps) => {

  const { slug } = await params;


  return (
    <div className='min-h-screen bg-[#F4F4F0] flex flex-col'>
      <Navbar slug={slug} />
      <div className="flex-1">
        <div className="max-w-(--breakpoint-xl) mx-auto">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Layout