"use client"

import Link from "next/link"
import { Poppins } from "next/font/google"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean
}

// 
const NavbarItem = ({href, children, isActive}:NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
        isActive && "bg-black text-white"
      )}
    >
      <Link href={href}>
        {children}
      </Link>
    </Button>
  )
}

const navbarItems = [
  {
    href: "/", children: "Home"
  },
  {
    href: "/about", children: "About"
  },
  {
    href: "/features", children: "Feature"
  },
  {
    href: "/pricing", children: "Pricing"
  },
  {
    href: "/contact", children: "Contact"
  },

]

export const Navbar = () => {

  const pathname = usePathname();

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href="/" className="pl-6 flex items-center">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          funroad
        </span>
      </Link>

      <div className="items-center gap-4 hidden lg:flex">
        {navbarItems.map((item) => (
          <NavbarItem 
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>
    </nav>
  )
}

