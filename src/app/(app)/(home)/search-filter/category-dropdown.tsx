"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Category } from "@/payload-types"
import { useRef, useState } from "react";
import UseDropdownPosition from "./use-dropdown-position";
import SubcategoryMenu from "./subcategory-menu";
import { CustomCategory } from "../types";

interface Props {
  category: CustomCategory;
  isActive: boolean;
  isNavigatioHovered: boolean;
}

const CategoryDropdown = ({ category, isActive, isNavigatioHovered }: Props) => {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getDropdownPosition } = UseDropdownPosition(dropdownRef);

  const onMouseEnter = () => {
    if(category.subcategories){
      setIsOpen(true);
    }
  };

  const onMouseLeave = () => {
    setIsOpen(false);
  };

  const dropdownPosition = getDropdownPosition();

  return (
    <div 
      className="relative"
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative">
        <Button 
          variant="elevated"
          className={cn(
            "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
            isActive && !isNavigatioHovered && "bg-white border-primary",
            isOpen && "bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[4px] -translate-y-[4px]"
          )}
        >
          {category.name}
        </Button>

        {/* Triangulo que indica el desplegable se muestra cuando hay subcategories y isOpen es true */}
        {category.subCategories && category.subCategories.length > 0 && (
          <div className={cn(
            "opacity-0 absolute -botton-3 w-0 h-0 border-l-[10px] border-r-[10px]  border-b-[10px] border-l-transparent border-r-transparent border-b-black left-1/2 -translate-x-1/2",
            isOpen && "opacity-100",
          )}
          />
        )}
      </div>

      <SubcategoryMenu 
        category={category}
        isOpen={isOpen}
        position={dropdownPosition}
      />
     
    </div>
  )
}

export default CategoryDropdown