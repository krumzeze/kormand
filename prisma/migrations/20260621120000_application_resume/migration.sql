-- Candidate can attach a resume (pdf/jpg/png) per application
ALTER TABLE "applications" ADD COLUMN "resumeUrl" TEXT;
