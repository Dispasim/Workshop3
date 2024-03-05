const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

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

  res.json({ message: 'Product deleted successfully' });
});

app.listen(port, () => {
  console.log(`E-commerce API Server is running on port ${port}`);
});
