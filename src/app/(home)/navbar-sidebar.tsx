import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"



interface NavbarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavbarItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NavbarSidebar = ({items, open, onOpenChange}: Props) => {
  return (
    <Sheet 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="left"
        className="p-0 transition-one"
      >
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <SheetTitle>
              Menu
            </SheetTitle>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default NavbarSidebar