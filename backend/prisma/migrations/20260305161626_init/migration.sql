-- CreateTable
CREATE TABLE "career_options" (
    "career_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "salary_range_min" INTEGER,
    "salary_range_max" INTEGER,
    "currency" VARCHAR(10) DEFAULT 'INR',
    "required_skills" TEXT[],
    "growth_rate" DECIMAL(5,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,

    CONSTRAINT "career_options_pkey" PRIMARY KEY ("career_id")
);

-- CreateTable
CREATE TABLE "career_recommendations" (
    "recommendation_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "age" INTEGER,
    "highschool_name" VARCHAR(150),
    "highschool_stream" VARCHAR(50),
    "college" VARCHAR(150),
    "course_type" VARCHAR(50),
    "course" VARCHAR(100),
    "specialisation" VARCHAR(100),
    "no_experience" BOOLEAN DEFAULT false,
    "job_title" VARCHAR(100),
    "company_name" VARCHAR(100),
    "duration" VARCHAR(50),
    "skills" TEXT,
    "interests" TEXT,
    "preferred_work_env" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ai_questions" JSON,
    "ai_answers" JSON,
    "final_recommendations" JSON,

    CONSTRAINT "career_recommendations_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateTable
CREATE TABLE "form_sessions" (
    "session_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "current_step" INTEGER NOT NULL,
    "total_steps" INTEGER NOT NULL,
    "ai_questions_generated" BOOLEAN NOT NULL DEFAULT false,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "form_questions" (
    "question_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "question_text" TEXT NOT NULL,
    "question_type" VARCHAR(50) NOT NULL,
    "options" JSON,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "order_sequence" INTEGER NOT NULL DEFAULT 0,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "category" VARCHAR(100) NOT NULL,

    CONSTRAINT "form_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "form_answers" (
    "answer_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_text" TEXT,
    "answer_json" JSON,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_answers_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "uid" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "idx_career_options_name" ON "career_options"("name");

-- CreateIndex
CREATE INDEX "idx_career_options_salary" ON "career_options"("salary_range_min", "salary_range_max");

-- CreateIndex
CREATE UNIQUE INDEX "form_answers_user_id_question_id_key" ON "form_answers"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- AddForeignKey
ALTER TABLE "career_options" ADD CONSTRAINT "career_options_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "career_recommendations" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "form_sessions" ADD CONSTRAINT "form_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_questions" ADD CONSTRAINT "form_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "form_questions"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;
