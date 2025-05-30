"use client"

import { Poppins } from "next/font/google"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTRPC } from "@/app/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { loginSchema } from "../../schemas"




const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});


export const SignInView = () => {

  const router = useRouter();
  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const login = useMutation(trpc.auth.login.mutationOptions({
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: async() => {
      // Invalidamos la consulta de sesión. Los datos almacenados en caché para esa consulta ya no son válidos y necesitan ser refrescados.
      // Se vuelva a ejecutar automáticamente la consulta auth.session -> Se actualicen todos los componentes que dependen de esta información
      await queryClient.invalidateQueries(trpc.auth.session.queryFilter()); // 
      router.push("/")
    }
  }))

  // METODO ALTERNATIVO DE LOGIN
  // const login = useMutation({
  //   mutationFn: async(values: z.infer<typeof loginSchema>) => {    // Usaremos este método solo con login porque en register hay que comprobar si existe el usuario
  //     const response = await fetch("/api/users/login", {           // Al crear una colleción de users en payload se generán automáticamente las rutas de autenticación
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(values),
  //     })

  //     if(!response.ok) {
  //       const error = await response.json()
  //       throw new Error(error.message ||"Failed to login")
  //     }

  //     return response.json()
  //   },
  //   onError: (error) => {
  //     toast.error(error.message)
  //   },
  //   onSuccess: () => {
  //     router.push("/")
  //   }
  // })

  const form = useForm<z.infer<typeof loginSchema>>({
    mode: "all",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values)
  }


  return (
    <div className='grid grid-cols-1 lg:grid-cols-5'>
      <div className='bg-[#F4F4F0] h-screnn w-full lg:col-span-3 overflow-y-auto'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8 p-4 lg:p-16"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <span className={cn(
                  "text-2xl font-semibold",
                  poppins.className
                )}>
                  funroad
                </span>
              </Link>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-base border-none underline"
              >
                <Link prefetch href="/sign-up">
                  Sign up
                </Link>
              </Button>
            </div>

            <h1 className="text-4xl font-medium">
              Welcome back to Funroad.
            </h1>

            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              variant="elevated"
              disabled={login.isPending}
              className="bg-black text-white hover:bg-pink-400 hover:text-primary"
            >
              Log in
            </Button>
          </form>
        </Form>
      </div>

      <div
        className='h-screen w-full lg:col-span-2 hidden lg:block'
        style={{
          backgroundImage: "url('/auth-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  )
}

