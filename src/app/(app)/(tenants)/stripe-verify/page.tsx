"use client"

import { useTRPC } from "@/app/trpc/client"
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { useEffect } from "react";

const Page = () => {

  const trpc = useTRPC();
  const { mutate: verify } = useMutation(trpc.checkout.verify.mutationOptions({ // Despues de darle al boton de verificación en el dashboard de payload -> 
    onSuccess: (data) => {                                                      // procedure checkout.verify -> data.url en stripe -> rellenamos los datos que nos pidan ->
      window.location.href = data.url                                           // striped emite el evento "account.updated" y nuestro webhook lo recibe -> 
    },                                                                          // actualiza en la coleccion tenants el stripeAccountId -> lo cual permite crear productos al tenant
    onError: (error) => {
      window.location.href = "/"
    }
  }));

  useEffect(() => {
    verify()
  },[verify])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground"/>
    </div>
  )
}

export default Page