import { useTRPC } from "@/app/trpc/client";
import { Checkbox } from "@/components/ui/checkbox";
import { DEFAULT_LIMIT } from "@/constants";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";


interface TagsFilterProps {
  value?: string[] | null; // array de tags
  onChange: (value: string[]) => void;
}

export const TagsFilter = ({ value, onChange }: TagsFilterProps) => {
  
  const trpc = useTRPC(); 
  const { 
    data, 
    isLoading, 
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery(trpc.tags.getMany.infiniteQueryOptions(
    {
    limit: DEFAULT_LIMIT
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.docs.length > 0 ? lastPage.nextPage : undefined
      }
    }
  ))

  const onClick = (tag: string) => {
    if (value?.includes(tag)) {                           // Comprueba si el tag ya está en el array 'value' (los tags seleccionados)
      onChange(value?.filter((t) => t !== tag) || [])     // Si está incluido, lo quitamos: Filtramos el array 'value', manteniendo solo los elementos que NO sean el tag clickeado.
    } else {                                              // Si no está incluido lo añadimos
      onChange([...(value || []), tag])                   // Creamos un nuevo array y 1º esparcimos los elementos actuales de value y 2. Añadimos el nuevo 'tag' al final de ese nuevo array.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <LoaderIcon className="size-4 animate-spin" />
        </div>
      ) : (
        data?.pages.map((page) => 
          page.docs.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between curosr-pointer"
              onClick={() => onClick(tag.name)}
            >
              <p className="font-medium">
                {tag.name}
              </p>
              <Checkbox 
                checked={value?.includes(tag.name)}
                onCheckedChange={() => onClick(tag.name)}
              />
            </div>
          ))
        )
      )}
      {hasNextPage && (
        <button
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          className="underline font-medium justify-start text-start disabled:opacity-50 cursor-pointer"
        >
          Load more...
        </button>
      )}
    </div>
  )
}

