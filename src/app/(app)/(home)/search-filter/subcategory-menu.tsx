import { Category } from "@/payload-types";

interface SubcategoryMenuProps {
  category: Category; // TODO: Cambiar esto
  isOpen: boolean;
  position: { top: number, left: number };
}


const SubcategoryMenu = ({ category, isOpen, position }: SubcategoryMenuProps) => {
 
    if(!isOpen || !category.subcategories || category.subcategories.length === 0) {
      return null;
    }

    const backgroundColor = category.color || "#F5F5F5";

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
          <p>
            Subcategory menu
          </p>
        </div>
      </div>
    )
  
}

export default SubcategoryMenu