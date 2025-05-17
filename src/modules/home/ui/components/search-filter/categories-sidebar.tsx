
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/app/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CategoriesGetManyOutput } from "@/modules/categories/types";


interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CategoriesSidebar = ({ open, onOpenChange }: Props) => {

  const trpc = useTRPC();
  const { data } = useQuery(trpc.categories.getMany.queryOptions()); // Petición de datos en el router categories que llama al procedimiento getMany. Se usan los datos de la precarga pero sino existiera se haría una petición nueva.

  const router = useRouter();

  const [parentCategories, setParentCategories] = useState<CategoriesGetManyOutput | null>(null); // Subcategorias
  const [selectedCategory, setSelectedCategory] = useState<CategoriesGetManyOutput[1] | null>(null);

  const currentCategories = parentCategories ?? data ?? []; // Si existe parentCategories se asigna ese valor sino data y sino existe data se asigna []

  const handleOpenChange = (open: boolean) => {
    setSelectedCategory(null);
    setParentCategories(null);
    onOpenChange(open);
  }

  const handleCategoryClick = (category: CategoriesGetManyOutput[1]) => () => {
    if(category.subcategories && category.subcategories.length > 0){    // Si la categoría tiene subcategorias
      setParentCategories(category.subcategories as CategoriesGetManyOutput);  // Guarda subcategorías en parentCategorias = currentCategories y asi se actualiza la vista    
      setSelectedCategory(category);
    }else {                                                             // Si la categoría no tiene subcategorias, estamos viendo subcatagorias de una subcategoria
      if (parentCategories && selectedCategory) {                       // seleccionamos subcategoria 
        router.push(`/${selectedCategory.slug}/${category.slug}`);      // se navega a la subcategoria
      }else{
        if (category.slug === "all") {                                  // La categoría NO tiene subcategorías Y estamos en el nivel principal
          router.push("/");                                             // se navega a la página principal
        }else{
          router.push(`/${category.slug}`);                             // Si no estamos en "all" se navega a la categoría
        }
      }

      handleOpenChange(false)
    }
  }

  const backgroundColor = selectedCategory?.color || "white";   
  
  const handleBackClick = () => {
    if(parentCategories){
      setParentCategories(null);
      setSelectedCategory(null);
    }
    
  }

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
    >
      <SheetContent
        side="left"
        className="p-0 transition-none"
        style={{ backgroundColor }}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            Categories
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {/* Se muestra el botón "Back" solo si hay subcategorias y estas se estan mostrando */}
          {parentCategories && (
            <button
              onClick={ handleBackClick }
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
            >
              <ChevronLeftIcon className="size-4 mr-2 cursor-pointer" />
              Back
            </button>
          )}

          {/* currentCategories determina que categorías se muestran en el sidebar y depende de handleCategoryClick */}
          {currentCategories.map((category) => (
            <button
              key={category.slug}
              onClick={handleCategoryClick(category)}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center justify-between text-base font-medium cursor-pointer"
            >
              {category.name}
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className="size-4"/>
              )}
            </button>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default CategoriesSidebar