import { Category } from "@/payload-types";
import Link from "next/link";
import { CustomCategory } from "../types";

interface SubcategoryMenuProps {
  category: CustomCategory; // TODO: Cambiar esto
  isOpen: boolean;
  position: { top: number, left: number };
}


const SubcategoryMenu = ({ category, isOpen, position }: SubcategoryMenuProps) => {
 
  if (
    !isOpen || 
    !category.subcategories || category.subCategories.length === 0) {              // Si no está abierto (isOpen es false) O no hay subcategorías, no renderiza NADA.
      return null;
    }

  const backgroundColor = category.color || "#F5F5F5";                           // Si isOpen es true Y hay subcategorías, continúa y renderiza el menú...

    return (
      <div 
        className="fixed z-100"
        style={{
          top: position.top,
          left: position.left,
        }}  
      >
        {/* invisible bridge to maintain hover */}
        <div className="h-3 w-60"/>
        <div 
          className="w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]"
          style={{
            backgroundColor
          }}  
        >
          <div>
            {category.subCategories?.map((subcategory: Category) => (
              <Link 
                key={subcategory.slug} 
                href="/" 
                className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium"
              >
                {subcategory.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  
}

export default SubcategoryMenu