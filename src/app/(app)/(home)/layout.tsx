import configPromise from '@payload-config';
import { getPayload } from 'payload';


import Footer from "./Footer";
import { Navbar } from "./Navbar";
import SearchFilters from "./search-filter";
import { Category } from '@/payload-types';
import { CustomCategory } from './types';



interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {

  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    depth: 1,
    pagination: false,
    where: {
      parent: {
        exists: false,
      },
    },
  });

  const formattedData:CustomCategory[] = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      ...(doc as Category),      // Se hace esto porque depth: 1 no devuelve el tipo correcto
      subcategories: undefined,  // No se hace populate de las subcategories aninadas debido a depth: 1 
    }))
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilters data={formattedData} />
      <div className="flex-1 bg-[#f4f4f0]">
        {children}
      </div>
      <Footer />
    </div>
  )
}

export default Layout