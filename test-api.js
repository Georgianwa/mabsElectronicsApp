// test-api.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

async function testAPI() {
  console.log('🧪 Testing MABS Electronics API\n');
  console.log('📍 Base URL:', BASE_URL);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check if server is running
  try {
    console.log('🔍 Checking if server is running...');
    const healthCheck = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('❌ Server is not running or not responding!');
    console.error('💡 Make sure you run: npm run dev');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return;
  }

  try {
    // 1. Register Admin
    console.log('1️⃣  Registering admin...');
    console.log('   URL:', `${BASE_URL}/admin/register`);
    
    const registerRes = await axios.post(`${BASE_URL}/admin/register`, {
      username: 'admin',
      password: 'Admin123456'
    });
    
    console.log('✅ Admin registered successfully');
    console.log('   Response:', registerRes.data);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    if (err.response) {
      // Server responded with error
      console.log('⚠️  Registration response:', err.response.status, err.response.statusText);
      console.log('   Message:', err.response.data.message || err.response.data);
      
      if (err.response.data.message === 'Admin already exists') {
        console.log('ℹ️  Admin already registered (this is fine)');
      } else {
        console.error('❌ Registration error details:', err.response.data);
      }
    } else if (err.request) {
      // Request was made but no response
      console.error('❌ No response from server');
      console.error('   Is the server running on http://localhost:5000?');
      return;
    } else {
      // Something else happened
      console.error('❌ Error:', err.message);
      return;
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  try {
    // 2. Login
    console.log('2️⃣  Logging in...');
    console.log('   URL:', `${BASE_URL}/admin/login`);
    
    const loginRes = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'Admin123456'
    });
    
    authToken = loginRes.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', authToken.substring(0, 30) + '...');
    console.log('   Admin:', loginRes.data.admin.username);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    if (err.response) {
      console.error('❌ Login failed:', err.response.status);
      console.error('   Message:', err.response.data.message || err.response.data);
      console.error('   Full error:', JSON.stringify(err.response.data, null, 2));
    } else if (err.request) {
      console.error('❌ No response from server');
    } else {
      console.error('❌ Error:', err.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return; // Stop if login fails
  }

  try {
    // 3. Create Brand
    console.log('3️⃣  Creating brand...');
    console.log('   URL:', `${BASE_URL}/brands`);
    
    const brandRes = await axios.post(`${BASE_URL}/brands`, {
      name: 'Test Brand ' + Date.now(),
      brandId: 'TB' + Date.now()
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Brand created successfully');
    console.log('   Brand:', brandRes.data.brand);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    if (err.response) {
      console.error('❌ Brand creation failed:', err.response.status);
      console.error('   Message:', err.response.data.message || err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  try {
    // 4. Get All Brands
    console.log('4️⃣  Getting all brands...');
    console.log('   URL:', `${BASE_URL}/brands`);
    
    const brandsRes = await axios.get(`${BASE_URL}/brands`);
    
    console.log('✅ Brands retrieved successfully');
    console.log('   Total brands:', brandsRes.data.total);
    console.log('   Brands:', brandsRes.data.brands.map(b => b.name).join(', '));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    if (err.response) {
      console.error('❌ Failed to get brands:', err.response.status);
      console.error('   Message:', err.response.data.message || err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  try {
    // 5. Create Category
    console.log('5️⃣  Creating category...');
    console.log('   URL:', `${BASE_URL}/categories`);
    
    const categoryRes = await axios.post(`${BASE_URL}/categories`, {
      title: 'Test Category ' + Date.now(),
      categoryId: 'TC' + Date.now(),
      description: 'Test category description'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Category created successfully');
    console.log('   Category:', categoryRes.data.category);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    if (err.response) {
      console.error('❌ Category creation failed:', err.response.status);
      console.error('   Message:', err.response.data.message || err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  try {
    // 6. Get All Categories
    console.log('6️⃣  Getting all categories...');
    console.log('   URL:', `${BASE_URL}/categories`);
    
    const categoriesRes = await axios.get(`${BASE_URL}/categories`);
    
    console.log('✅ Categories retrieved successfully');
    console.log('   Total categories:', categoriesRes.data.total || categoriesRes.data.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    if (err.response) {
      console.error('❌ Failed to get categories:', err.response.status);
      console.error('   Message:', err.response.data.message || err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  try {
    // 7. Get All Products
    console.log('7️⃣  Getting all products...');
    console.log('   URL:', `${BASE_URL}/products`);
    
    const productsRes = await axios.get(`${BASE_URL}/products`);
    
    console.log('✅ Products retrieved successfully');
    console.log('   Total products:', productsRes.data.total);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    if (err.response) {
      console.error('❌ Failed to get products:', err.response.status);
      console.error('   Message:', err.response.data.message || err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  console.log('✅ All tests completed!\n');
}

// Run the tests
testAPI().catch(err => {
  console.error('💥 Unexpected error:', err.message);
  console.error(err.stack);
});