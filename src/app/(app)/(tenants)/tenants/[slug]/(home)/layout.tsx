import { Navbar } from "@/modules/tenants/ui/components/navbar";




interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{slug: string}>;

}

const Layout = async({ children }: LayoutProps) => {


  return (
    <div className='min-h-screen bg-[#F4F4F0] flex flex-col'> 
      <Navbar />
      {children}
    </div>
  )
}

export default Layout