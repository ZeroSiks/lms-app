-- Add GIN trigram indexes for full-text search on courses
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_course_title_trgm ON "Course" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_course_description_trgm ON "Course" USING GIN ("description" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_course_code_lower ON "Course" (LOWER("code"));
CREATE INDEX IF NOT EXISTS idx_user_email_trgm ON "User" USING GIN ("email" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_user_name_trgm ON "User" USING GIN ((("firstName" || ' ' || "lastName")) gin_trgm_ops);
