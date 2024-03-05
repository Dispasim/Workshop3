const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const { Client } = require('cassandra-driver');

const client = new Client({
  contactPoints: ['localhost'], 
  localDataCenter: 'datacenter1',
  keyspace: 'ecommerce_keyspace',
});

app.use(bodyParser.json());

//Question 2.1

let products = [
  { id: 1, name: 'Pull blanc', description: 'Pull de couleur blanc', price: 20, category: 'Vêtement', inStock: true },
  { id: 2, name: 'Cactus', description: 'Plante qui pique', price: 5, category: 'Plante', inStock: false },
];

app.use(bodyParser.json());

app.get('/products', (req, res) => {
  const { category, inStock } = req.query;

  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(product => product.category.toLowerCase() === category.toLowerCase());
  }

  if (inStock !== undefined) {
    filteredProducts = filteredProducts.filter(product => product.inStock === (inStock === 'true'));
  }

  res.json(filteredProducts);
});

app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

app.post('/products', (req, res) => {
  const newProduct = req.body;
  const productId = products.length + 1;

  const product = {
    id: productId,
    ...newProduct
  };

  products.push(product);

  res.status(201).json(product);
});

app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;

  let productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[productIndex] = {
    ...products[productIndex],
    ...updatedProduct
  };

  res.json(products[productIndex]);
});

app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(productIndex, 1);

  res.json({ message: 'Product deleted' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



//Question 2.2
let orders = [];

app.post('/orders', (req, res) => {
  const { products: orderedProducts, user } = req.body;

  if (!orderedProducts || !Array.isArray(orderedProducts) || orderedProducts.length === 0) {
    return res.status(400).json({ error: 'Products missingr.' });
  }

  for (const orderedProduct of orderedProducts) {
    const productExists = products.some(product => product.id === orderedProduct.productId);
    if (!productExists) {
      return res.status(400).json({ error: `Product with ID ${orderedProduct.productId} not found.` });
    }
  }

  const orderTotal = orderedProducts.reduce((total, orderedProduct) => {
    const product = products.find(p => p.id === orderedProduct.productId);
    return total + product.price * orderedProduct.quantity;
  }, 0);

  const newOrder = {
    orderId: orders.length + 1,
    userId: user?.userId || null,
    products: orderedProducts,
    total: orderTotal,
    status: 'Status...',
  };

  orders.push(newOrder);

  res.status(201).json(newOrder);
});

app.get('/orders/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userOrders = orders.filter(order => order.userId === userId);

  res.json(userOrders);
});

//Question 2.3

let userCarts = [];

app.post('/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { productId, quantity } = req.body;

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(400).json({ error: `Product with ID ${productId} not found.` });
  }

  let userCart = userCarts.find(cart => cart.userId === userId);

  if (!userCart) {
    userCart = { userId, items: [] };
    userCarts.push(userCart);
  }

  const cartItem = userCart.items.find(item => item.productId === productId);

  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    userCart.items.push({ productId, quantity });
  }

  res.json(userCart);
});

app.get('/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userCart = userCarts.find(cart => cart.userId === userId);

  if (!userCart) {
    return res.status(404).json({ error: 'Shopping cart not found for the user.' });
  }

  res.json(userCart);
});

app.delete('/cart/:userId/item/:productId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);

  const userCart = userCarts.find(cart => cart.userId === userId);

  if (!userCart) {
    return res.status(404).json({ error: 'Shopping cart not found for the user.' });
  }

  userCart.items = userCart.items.filter(item => item.productId !== productId);

  res.json(userCart);
});
