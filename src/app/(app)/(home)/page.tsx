"use client"



import { useTRPC } from "@/app/trpc/client";
import { useQuery } from "@tanstack/react-query";


export default function Home() {

  const trpc = useTRPC();
  const categories = useQuery(trpc.categories.getMany.queryOptions()); // petición de datos en el router categories que llama al procedimiento getMany
  
  return (
    <div className="p-4">
     {JSON.stringify(categories.data, null, 2)}
    </div>
  );
}
