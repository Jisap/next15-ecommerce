import Image from "next/image";
import Link from "next/link";


interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
}

export const ProductCard = ({ 
  id, 
  name, 
  imageUrl, 
  authorUsername, 
  authorImageUrl, 
  reviewRating, 
  reviewCount, 
  price
}: ProductCardProps) => {

  return (
    <Link href="/">
      <div className="border rounded-md bg-white overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square">
          <Image 
            alt={name}
            fill
            src={imageUrl || "/placeholder.png"}
            className="object-cover"
          />
        </div>

        <div className="p-4 border-y flex flex-col gap-3 flex-1">
          <h2 className="text-lg font-medium line-clamp-4">
            {name}
          </h2>
          
          {/* TODO: redirect to user shop */}
          <div className="flex items-center gap-2">
            {authorImageUrl && (
              <Image 
                alt={authorUsername}
                src={authorImageUrl}
                width={16}
                height={16}
                className="rounded-full border shrink-0 size-[16px]"
              />
            )}
            
            <p className="text-sm underline font-medium">
              {authorUsername}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}