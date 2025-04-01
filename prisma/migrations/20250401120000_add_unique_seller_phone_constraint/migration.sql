-- Up migration: Add the partial unique index
CREATE UNIQUE INDEX "unique_seller_phone_details" 
ON "PhoneModelDetails" ("sellerId", "phoneModelId", "colorId", "storage", "condition")
WHERE "available" = true AND "purchased" = false;

-- Down migration (commented out, uncomment to revert)
-- DROP INDEX "unique_seller_phone_details";