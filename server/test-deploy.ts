const API_URL = 'http://localhost:5000';

async function testDeployment() {
  try {
    console.log('Step 1: Logging in as test user...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'horlapookie@gmail.com',
        password: 'Omotoyosi',
      }),
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('User:', loginData);

    // Get session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    
    console.log('\nStep 2: Deploying bot...');
    const sessionId = 'eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiTURiUmQ1MmVpb0toN0ZRSnBTajZMVWdkaDE1cFhEUGlrZHRTVlpSTzFrUT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiSTUydElPZy9VbEpzU2dQMHkrMWd4VXl5L0FpMjBnWVJkTFMwUnFEWFF6az0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiIrSCs1eGs2TllwSm1tUy9CVUUrV3RmYzlJYUtZQmV2eXpTTzVCYjZBTjNZPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJrZGNEQk5YT1RYWWNsY0xNYUR6YTNiRWlNWVhtU2oxVWErOXJvRjNKTVVvPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkFDTEU3Q3JKdjVjYXlPWFRKdWh5ZVRUYjM0aTBHSVlCNzB4SFgxbVZnR2M9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Ik5tZnlxWDllVU1Wa1Z3dlhJZGFZUytUaDRzbkNUeUR6UXJUckJTZVFERzg9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0tGYzd4aHYzMElEc3lyaFlTTjdsUDdmRStFcktWRmJQMVpOZEpTcTYzbz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoianhIYjhVV2NqMWpta3l1L2dNUFo4T05KQy9FTEVmV0NRV3VUd0lla3cxOD0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IlkxbXhFNGg0dGM2ZUFWd0YrTVpXRjYzWlVMKzNmMkJBTDhSQmFiUHd4dDY4d2xBb3lwZkxXTE5mYk5NVFAxV3VyRzhjQTBvaXdVeUFTNDNmR3k0TkFRPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTkwLCJhZHZTZWNyZXRLZXkiOiIvMTltUFEwb3pRbHlZSUZHaUdDSXBkSThnb1Y4S0lTUHp6Nkx2d1U5OHJVPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W3sia2V5Ijp7InJlbW90ZUppZCI6IjIzNDcwODkyODUyODlAcy53aGF0c2FwcC5uZXQiLCJmcm9tTWUiOnRydWUsImlkIjoiQUM4NkUzRjQ1Q0E5RkZGNTdGRjk2M0QzNDUyQzA5RTYifSwibWVzc2FnZVRpbWVzdGFtcCI6MTc2MDQ1NTgxNX0seyJrZXkiOnsicmVtb3RlSmlkIjoiMjM0NzA4OTI4NTI4OUBzLndoYXRzYXBwLm5ldCIsImZyb21NZSI6dHJ1ZSwiaWQiOiJBQzE5NTAzRkZENUYzMTZBMzc4RTk3RUEwNTUxOEE1MyJ9LCJtZXNzYWdlVGltZXN0YW1wIjoxNzYwNDU1ODE2fV0sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjoxLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwiZGV2aWNlSWQiOiIzeEI3MTFSb1JtLUY4WG9yRXBUR2VBIiwicGhvbmVJZCI6ImUxNGIxZmVhLWUzZDYtNDBiNS04OWY4LTY1YzNkNjQ5NDU3NSIsImlkZW50aXR5SWQiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJGc2dOWk1TMlZPR3R1WC9MMVBDZFdQSnFDNkk9In0sInJlZ2lzdGVyZWQiOnRydWUsImJhY2t1cFRva2VuIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoia1U3S1RuWktnTGs1Y0tMRjgzT0Z0Y25uSDdzPSJ9LCJyZWdpc3RyYXRpb24iOnt9LCJwYWlyaW5nQ29kZSI6Ik1STUFMVklOIiwibWUiOnsiaWQiOiIyMzQ3MDg5Mjg1Mjg5OjFAcy53aGF0c2FwcC5uZXQiLCJsaWQiOiIyMzAwNzM0MTIwOTYxODg6MUBsaWQifSwiYWNjb3VudCI6eyJkZXRhaWxzIjoiQ08ySDRlUUJFUFhZdWNjR0dBRWdBQ2dBIiwiYWNjb3VudFNpZ25hdHVyZUtleSI6IjRQR2FuZDFWVFlPYkNQdm9veUJKQjhRUWE3RUU5K0hEa1A3UEJSUGNhUUU9IiwiYWNjb3VudFNpZ25hdHVyZSI6ImMxZ1lSM1dzNS8xdkpXT2lSaXpJMDJWS3NrVDBkcnJvTFUzM3g5aE5UdzMwTHYwVEY5WjRFUVF1TmtVcjVRbVVDeitKTkoveDg1SENWaGkyeVZxaUNBPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJ3d2l0aFVMT1RFMlkzc0RSUUpPWnY2REsyQmIxMnlTcEVCSDZJSWZobWcwSlBGcDNnWGxhVHYvMEMyNVA0amZqU3huQUhEMjRkdUNlUG9WV3k4UDZBQT09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjIzNDcwODkyODUyODk6MUBzLndoYXRzYXBwLm5ldCIsImRldmljZUlkIjowfSwiaWRlbnRpZmllcktleSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkJlRHhtcDNkVlUyRG13ajc2S01nU1FmRUVHdXhCUGZodzVEK3p3VVQzR2tCIn19XSwicGxhdGZvcm0iOiJhbmRyb2lkIiwicm91dGluZ0luZm8iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJDQTBJQ0E9PSJ9LCJsYXN0QWNjb3VudFN5bmNUaW1lc3RhbXAiOjE3NjA0NTU4MTIsIm15QXBwU3RhdGVLZXlJZCI6IkFBQUFBQmI1In0=';
    
    const deployResponse = await fetch(`${API_URL}/api/bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '',
      },
      body: JSON.stringify({
        phone: '2348028336218',
        prefix: '?',
        sessionId: sessionId,
      }),
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      console.error('Deployment failed:', errorText);
      return;
    }

    const deployData = await deployResponse.json();
    console.log('✅ Bot deployment initiated!');
    console.log('Bot details:', deployData);

    // Wait a bit and check status
    console.log('\nStep 3: Checking bot status...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const botsResponse = await fetch(`${API_URL}/api/bots`, {
      method: 'GET',
      headers: {
        'Cookie': cookies || '',
      },
    });

    if (botsResponse.ok) {
      const bots = await botsResponse.json();
      console.log('Current bots:', bots);
    }

  } catch (error) {
    console.error('Error during test:', error);
  }
}

testDeployment();
