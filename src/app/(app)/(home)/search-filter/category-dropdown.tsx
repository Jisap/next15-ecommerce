import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Category } from "@/payload-types"

interface Props {
  category: Category;
  isActive: boolean;
  isNavigatioHovered: boolean;
}

const CategoryDropdown = ({ category, isActive, isNavigatioHovered }: Props) => {
  return (
    <Button 
      variant="elevated"
      className={cn(
        "h-11 px-4 bg-transparent rounded-full hover:bg-white hover:border-primary text-black"
      )}
    >
      {category.name}
    </Button>
  )
}

export default CategoryDropdown