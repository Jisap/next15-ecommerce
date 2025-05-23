"use client"

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { useTRPC } from "@/app/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ReviewSidebar } from "../components/review-sidebar"
import { RichText } from "@payloadcms/richtext-lexical/react"
import Image from "next/image"
import { Suspense } from "react"
import { ReviewFormSkeleton } from "../components/review-form"



interface Props {
  productId: string
}

const ProductView = ({ productId }: Props) => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.library.getOne.queryOptions({
    productId
  }))
 
  const imageObject = data.image && typeof data.image === 'object' ? data.image : null; // Si el campo image es un objeto, devolverlo, sino devolver null
  
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-4 bg-[#F4F4F0] w-full border-b">
        <Link prefetch href="/library" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Back to Library</span>
        </Link>
      </nav>

      <header className="bg-[#F4F4F0] py-8 border-b">
        <div className="max-w-(--breackpoint-xl) mx-auto px-4 lg:px-12">
          <h1 className="text-[40px] font-medium">{ data.name }</h1>
        </div>
      </header>

      <section className="max-w-(--breackpoint-xl) mx-auto px-4 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="p-4 bg-white rounded-md border gap-4">
              <Suspense fallback={<ReviewFormSkeleton />}>
                <ReviewSidebar productId={productId} />
              </Suspense>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Suspense fallback={
              <div className="animate-pulse">
                <div className="h-[400px] bg-gray-200 rounded-lg mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="order-2 md:order-1">
                  {data.content ? (  
                    <RichText data={data.content} />    
                  ) : (
                    <p className="font-medium italic text-muted-foreground">
                      No special content
                    </p>
                  )}
                </div>
                
                <div className="relative order-1 md:order-2 aspect-square">
                  <Image 
                    src={imageObject?.url || "/placeholder.png"}
                    alt={imageObject?.alt || data.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductView


export const ProductViewSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-4 bg-[#F4F4F0] w-full border-b">
        <div className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Back to Library</span>
        </div>
      </nav>
    </div>
  )
}