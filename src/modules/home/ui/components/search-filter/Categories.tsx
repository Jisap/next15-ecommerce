"use client"

import CategoryDropdown from "./category-dropdown";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListFilterIcon } from "lucide-react";
import CategoriesSidebar from "./categories-sidebar";
import { CategoriesGetManyOutput } from "@/modules/categories/types";

interface CategoriesProps {
  data: CategoriesGetManyOutput;
}

const Categories = ({ data }: CategoriesProps) => {

  const containerRef = useRef<HTMLDivElement>(null);                  // referencia al contenedor visible de las categorías.
  const measureRef = useRef<HTMLDivElement>(null);                    // ref al contenedor invisible que se usa para medir el ancho de cada categoría.
  const viewAllRef = useRef<HTMLDivElement>(null);                    // referencia al botón "View All".

  const [visibleCount, setVisibleCount] = useState(data.length);      // cuántas categorías se pueden mostrar antes de que se exceda el ancho.
  const [isAnyHovered, setIsAnyHovered] = useState(false);            // si el mouse está sobre las categorías.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);      

  const activeCategory = "all"                                                                        // Se define una categoría mock hasta implementar la funcional
  const activeCategoryIndex = data.findIndex((cat) => cat.slug === activeCategory);                   // Se busca la posición de la categoría activa dentro del array data.
  const isActiveCategoryHidden = activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1;   // Devuelve true si El índice de la categoría activa está más allá del número de categorías visibles -> se usa para determinar si el botón "View All" debe cambiar su forma de mostrarse para indicar que hay categorías ocultas.

  // Este efecto se encarga de calcular cuántas categorías caben horizontalmente en el contenedor 
  // antes de que el botón "View All" quede fuera de lugar.Así, 
  // se decide cuántas mostrar(visibleCount) y cuántas ocultar.
  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current || !measureRef.current || !viewAllRef.current) return;                // Nos aseguramos de que las referencias estén montadas en el DOM.

      const containerWidth = containerRef.current.offsetWidth;                                        // ancho total disponible para las categorías.
      const viewAllWidth = viewAllRef.current.offsetWidth;                                            // espacio que ocupará el botón "View All".
      const availableWidth = containerWidth - viewAllWidth;                                           // cuánto queda para mostrar categorías.

      const items = Array.from(measureRef.current.children);                                          // obtenemos todos los elementos hijos del contenedor invisible.
      let totalWidth = 0;
      let visible = 0;

      for (const item of items) {                                                                     // Aquí se simula (de forma invisible) cuántos ítems caben horizontalmente antes de pasarse del espacio disponible. El bucle se detiene cuando uno ya no cabe.
        const width = item.getBoundingClientRect().width;                                             // obtenemos el ancho del elemento.

        if(totalWidth + width > availableWidth) break;                                                // si el ancho total ya supera el espacio disponible, se detiene el bucle.
        totalWidth += width;                                                                          // si no, se suma el ancho del elemento.
        visible++;                                                                                    // y se incrementa el contador de elementos visibles.
      }

      setVisibleCount(visible);                                                                       // actualizamos el valor de visibleCount. Esto determina cuántas categorías se deben renderizar visualmente en el DOM.
    }

    const resizeObserver = new ResizeObserver(calculateVisible);                                      // Se crea un ResizeObserver que escucha cambios de tamaño del contenedor.
    resizeObserver.observe(containerRef.current!);                                                    // Si el usuario redimensiona la ventana, el cálculo se actualiza.

    calculateVisible();

    return () => {
      resizeObserver.disconnect();
    }
  },[data.length])


  return (
    <div className="relative w-full">
      {/* Categories sidebar */}
      <CategoriesSidebar 
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
      />

      {/* hidden items */}
      <div 
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none flex"
        style={{ position: "fixed", top: -9999, left: -9999 }}
      >
        {data.map((category) => (
            <div key={category.id}>
              <CategoryDropdown
                category={category}
                isActive={activeCategory === category.slug}
                isNavigatioHovered={false}
              />
            </div>
        ))}
      </div>

      {/* visible items */}
      <div 
        ref={containerRef}
        className="flex flex-nowrap items-center"
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}
      >
        {data.slice(0, visibleCount).map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigatioHovered={isAnyHovered}
            />
          </div>
        ))}

        <div ref={viewAllRef} className="shrink-0">
          <Button
             className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
              isActiveCategoryHidden && !isAnyHovered && "bg-red-700 border-primary"
            )}
            onClick={() => setIsSidebarOpen(true)}
          >
            View All
            <ListFilterIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Categories