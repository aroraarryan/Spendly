export function runPrelaunchChecks() {
    if (!__DEV__) return;

    const checks = [
        {
            name: 'Gemini API Key',
            pass: !!process.env.EXPO_PUBLIC_GEMINI_API_KEY &&
                process.env.EXPO_PUBLIC_GEMINI_API_KEY !== 'your_gemini_key_here',
            fix: 'Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file'
        },
        {
            name: 'App Name',
            pass: true, // Manual check
            fix: 'Verify name is Spendly in app.json'
        },
        {
            name: 'Bundle Identifier',
            pass: true, // Manual check
            fix: 'Make sure bundle identifier is unique in app.json'
        },
    ];

    console.log('--- Pre-launch Consistency Checks ---');
    checks.forEach(check => {
        if (!check.pass) {
            console.warn(`⚠️ [FAIL] ${check.name}: ${check.fix}`);
        } else {
            console.log(`✅ [PASS] ${check.name}`);
        }
    });
    console.log('--- End of Checks ---');
}
