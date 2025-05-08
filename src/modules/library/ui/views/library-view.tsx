

import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"


const LibraryView = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-4 bg-[#F4F4F0] w-full border-b">
        <Link prefetch href="/" className="flex items-center gap-2">
          <ArrowLeftIcon className="size-4" />
          <span className="text font-medium">Continue shopping</span>
        </Link>
      </nav>

      <header className="bg-[#F4F4F0] py-8 border-b">
        <div className="max-w-(--breackpoint-xl) mx-auto px-4 lg:px-12 flex flex-col gap-y-4">
          <h1 className="text-[40px] font-medium">Library</h1>
          <p className="font-medium">
            Your purchases & reviews
          </p>
        </div>
      </header>

      <section className="max-w-(--breackpoint-xl) mx-auto px-4 lg:px-12 py-10">
        
      </section>
    </div>
  )
}

export default LibraryView