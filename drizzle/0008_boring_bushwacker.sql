ALTER TABLE "orders_items" DROP CONSTRAINT "orders_items_product_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;