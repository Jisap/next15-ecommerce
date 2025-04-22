"use client"



import { useTRPC } from "@/app/trpc/client";
import { useQuery } from "@tanstack/react-query";


export default function Home() {

  const trpc = useTRPC();
  const categories = useQuery(trpc.categories.getMany.queryOptions()); // petición http a la ruta /api/trpc -> categoriesRouter -> procedimiento -> rdo serializado devuelto
  
  return (
    <div className="p-4">
      <p>is loading: {categories.isLoading}</p>
     {JSON.stringify(categories.data, null, 2)}
    </div>
  );
}
