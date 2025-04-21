import { CustomCategory } from "../types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"



interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CustomCategory[]; // TODO: Remove this later
}

const CategoriesSidebar = ({ open, onOpenChange, data }: Props) => {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="left"
        className="p-0 transition-none"
        style={{ backgroundColor: "white" }}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            Categories
          </SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default CategoriesSidebar