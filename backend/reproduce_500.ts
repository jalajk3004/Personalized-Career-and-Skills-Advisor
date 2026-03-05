import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
    try {
        // 1. Create a test user
        console.log('Creating test user...');
        await prisma.$executeRawUnsafe(`
      INSERT INTO users (uid, email) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET uid = EXCLUDED.uid
    `, 'test_uid_123', 'test@example.com');

        const user = await prisma.$queryRawUnsafe<{ user_id: number }[]>(
            'SELECT user_id FROM users WHERE uid = $1', 'test_uid_123'
        );
        const user_id = user[0].user_id;
        console.log('User ID:', user_id);

        // 2. Test the recommendation insertion
        const text = `
      INSERT INTO career_recommendations (
        user_id, name, age, highschool_name, highschool_stream, 
        college, course_type, course, specialisation, no_experience,
        job_title, company_name, duration, skills, interests,
        preferred_work_env
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16
      )
      RETURNING recommendation_id
    `;
        const params = [
            user_id, 'Test User', 25, 'HS', 'Science',
            'College', 'Full-time', 'CS', 'AI', false,
            'Dev', 'Co', '1y', 'JS', 'Coding',
            'Remote'
        ];

        console.log('Executing insertion query...');
        // In pg, it returns { rows: [...] }
        // In Prisma $queryRawUnsafe, it returns an array [...]
        const res = await prisma.$queryRawUnsafe(text, ...params);
        console.log('Result type:', typeof res);
        console.log('Result:', JSON.stringify(res, null, 2));

        if (Array.isArray(res) && res.length > 0) {
            console.log('recommendation_id:', (res[0] as any).recommendation_id);
        } else {
            console.log('No rows returned or not an array');
        }
    } catch (err) {
        console.error('Full Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
