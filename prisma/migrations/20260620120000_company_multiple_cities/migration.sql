-- Company can operate in several cities at once: city -> cities[]
ALTER TABLE "companies" ADD COLUMN "cities" TEXT[];

UPDATE "companies"
SET "cities" = CASE
  WHEN "city" IS NOT NULL AND "city" <> '' THEN ARRAY["city"]
  ELSE '{}'::TEXT[]
END;

ALTER TABLE "companies" DROP COLUMN "city";
