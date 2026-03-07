/**
 * Simple script to benchmark Node.js backend performance
 * Requirements: 20 concurrent users, simulating ~100 daily users.
 */

const TARGET_URL = 'http://localhost:3000'; // Đổi URL nếu test môi trường production
const CONCURRENT_USERS = 20;

// Các API Endpoint nhẹ tốn ít token để test tải CPU/DB
const ENDPOINTS = [
    '/',
    '/api/restaurants',
    '/api/dishes',
    '/api/trending'
];

async function simulateUserActivity(userId) {
    let successCount = 0;
    let errorCount = 0;
    let totalTime = 0;

    // Simulate 1 user navigating through 4 random pages
    for (let i = 0; i < 4; i++) {
        const url = TARGET_URL + ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
        const start = Date.now();

        try {
            const res = await fetch(url);
            if (res.ok) successCount++;
            else {
                errorCount++;
                console.log(`Failed HTTP ${res.status}: ${url}`);
            }
        } catch (err) {
            errorCount++;
            console.log(`Fetch error: ${err.message}`);
        }

        totalTime += (Date.now() - start);

        // Nghỉ ngơi giữa các thao tác (giả lập thao tác người dùng đọc trang)
        await new Promise(r => setTimeout(r, Math.random() * 500 + 200));
    }

    return { userId, successCount, errorCount, avgResponseTime: totalTime / 4 };
}

async function runLoadTest() {
    console.log(`🚀 Starting Load Test with ${CONCURRENT_USERS} concurrent users...`);
    const startTime = Date.now();

    // Tạo 20 promises chạy cùng lúc
    const userPromises = Array.from({ length: CONCURRENT_USERS }, (_, i) => simulateUserActivity(i + 1));

    // Đợi tất cả users hoàn thành
    const results = await Promise.all(userPromises);

    const totalTime = (Date.now() - startTime) / 1000;

    // Aggregate results
    let totalSuccess = 0;
    let totalError = 0;
    let sumResponseTime = 0;

    results.forEach(r => {
        totalSuccess += r.successCount;
        totalError += r.errorCount;
        sumResponseTime += r.avgResponseTime;
    });

    console.log('\n📊 --- TEST RESULTS --- 📊');
    console.log(`Total Target: ${CONCURRENT_USERS} users simultaneously`);
    console.log(`Execution Time: ${totalTime.toFixed(2)}s`);
    console.log(`Total Requests: ${totalSuccess + totalError}`);
    console.log(`Success: ${totalSuccess} | Errors: ${totalError}`);
    console.log(`Avg Request Time: ${(sumResponseTime / CONCURRENT_USERS).toFixed(2)}ms`);

    if (totalError === 0 && (sumResponseTime / CONCURRENT_USERS) < 2000) {
        console.log('\n✅ Khả năng chịu tải RẤT TỐT: Vượt qua bài test 20CCU an toàn.');
    } else {
        console.log('\n⚠️ Hệ thống đang có dấu hiệu quá tải, cần tối ưu lại Vercel/Supabase.');
    }
}

runLoadTest();
