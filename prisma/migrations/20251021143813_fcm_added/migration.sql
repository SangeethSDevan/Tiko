-- CreateTable
CREATE TABLE "public"."Token" (
    "user_id" TEXT NOT NULL,
    "fcm_token" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "public"."Token" ADD CONSTRAINT "Token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
