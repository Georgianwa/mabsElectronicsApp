{
  "clientName": "Thunder Client",
  "collectionName": "MABS Electronics API",
  "collectionId": "mabs-electronics",
  "dateExported": "2024-01-01",
  "version": "1.0",
  "requests": [
    {
      "name": "Register Admin",
      "method": "POST",
      "url": "http://localhost:5000/api/admin/register",
      "body": {
        "type": "json",
        "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"Admin123456\"\n}"
      }
    },
    {
      "name": "Login Admin",
      "method": "POST",
      "url": "http://localhost:5000/api/admin/login",
      "body": {
        "type": "json",
        "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"Admin123456\"\n}"
      }
    },
    {
      "name": "Create Brand",
      "method": "POST",
      "url": "http://localhost:5000/api/brands",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{token}}"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"name\": \"Samsung\",\n  \"brandId\": \"BRAND001\"\n}"
      }
    },
    {
      "name": "Get All Brands",
      "method": "GET",
      "url": "http://localhost:5000/api/brands"
    },
    {
      "name": "Create Category",
      "method": "POST",
      "url": "http://localhost:5000/api/categories",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{token}}"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"title\": \"Smartphones\",\n  \"categoryId\": \"CAT001\",\n  \"description\": \"Mobile phones\"\n}"
      }
    },
    {
      "name": "Get All Categories",
      "method": "GET",
      "url": "http://localhost:5000/api/categories"
    },
    {
      "name": "Get All Products",
      "method": "GET",
      "url": "http://localhost:5000/api/products"
    },
    {
      "name": "Add to Cart",
      "method": "POST",
      "url": "http://localhost:5000/api/cart/add",
      "body": {
        "type": "json",
        "raw": "{\n  \"productId\": \"prod123\",\n  \"name\": \"Samsung Galaxy\",\n  \"price\": 999.99,\n  \"quantity\": 1\n}"
      }
    },
    {
      "name": "Get Cart",
      "method": "GET",
      "url": "http://localhost:5000/api/cart"
    }
  ]
}