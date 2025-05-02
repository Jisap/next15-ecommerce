import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"
import Link from "next/link"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
})

export const Footer = () => {
  return (
    <footer className='border-t font-medium bg-white'>
      <div className='max-w-(--breakpoint-xl) mx-auto flex items-center h-full gap-2 px-4  py-6lg:px-12'>
        <p>Powered By</p>
        <Link href="/">
          <span className={cn("text-2xl font-semibold", poppins.className)}>
            funroad
          </span>
        </Link>
      </div>
    </footer>
  )
}