-- ========================================
-- Schema Definition for Career Platform
-- Tables: users, career_options, career_recommendations
-- ========================================

-- ===================
-- Table: users
-- ===================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    uid VARCHAR(255) UNIQUE NOT NULL
);

-- ===================
-- Table: career_options
-- ===================
CREATE TABLE career_options (
    career_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    currency VARCHAR(10) DEFAULT 'INR',
    required_skills TEXT[],
    growth_rate NUMERIC(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    CONSTRAINT career_options_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

-- Indexes for career_options
CREATE INDEX idx_career_options_name ON career_options(name);
CREATE INDEX idx_career_options_salary ON career_options(salary_range_min, salary_range_max);

-- ===================
-- Table: career_recommendations
-- ===================
CREATE TABLE career_recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INTEGER,
    highschool_name VARCHAR(150),
    highschool_stream VARCHAR(50),
    college VARCHAR(150),
    course_type VARCHAR(50),
    course VARCHAR(100),
    specialisation VARCHAR(100),
    no_experience BOOLEAN DEFAULT false,
    job_title VARCHAR(100),
    company_name VARCHAR(100),
    duration VARCHAR(50),
    skills TEXT,
    interests TEXT,
    preferred_work_env VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_questions JSON,
    ai_answers JSON,
    final_recommendations JSON,
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

-- Partial index for career_recommendations
CREATE INDEX idx_career_recommendations_ai_questions 
ON career_recommendations(recommendation_id)
WHERE ai_questions IS NOT NULL;

