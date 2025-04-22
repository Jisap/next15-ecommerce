import { baseProcedure, createTRPCRouter } from "@/app/trpc/init";


export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    return [ {hello: "world"} ]
  })
})