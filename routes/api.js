const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const authenticate = require('../auth/authenticate'); 

// Get all the products
router.get('/products',authenticate, async (req, res) => {
  try {
    const products = await Product.find().populate('category')
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new product
router.post('/products',authenticate, async (req, res) => {
  const category = req.body.category;

  let categoryUUID = await Category.findOne({name: category})
  categoryUUID = categoryUUID?._id;
  if(!categoryUUID)res.status(400).json({message: 'invalid category, please create category first'})

  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    category: categoryUUID,
    modificationDateTime: req.body.modificationDateTime
  });
  try {
    let newProduct = await product.save();

    let responseProduct = {name: newProduct.name, price: newProduct.price,
      category: req.body.category, modificationDateTime: newProduct.modificationDateTime};

    res.status(201).json(responseProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get product by id
router.get('/products/:id',authenticate, getProduct, (req, res) => {
  res.json(res.product);
});

// Update info about product by id
router.patch('/products/:id',authenticate, getProduct, async (req, res) => {
  if (req.body.name) {
    res.product.name = req.body.name;
  }

  if (req.body.price) {
    res.product.price = req.body.price;
  }

  if (req.body.category) {
    res.product.category = req.body.category;
  }

  try {
    const updatedProduct = await res.product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product by id
router.delete('/products/:id',authenticate, getProduct, async (req, res) => {
  try {
    await Product.deleteOne({ _id: res.product._id });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
});

// Middleware for getting product
async function getProduct(req, res, next) {
  try {
    if(req.user){
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.product = product;
    next();
  }else {
    return res.status(401).json({ message: 'Authentication required' });
  }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
// Middleware for getting category
async function getCategory(req, res, next) {
  try {
    if(req.user){
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.category = category;
    next();
  }else {
    return res.status(401).json({ message: 'Authentication required' });
  }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


// Create a new category
router.post('/categories',authenticate, async (req, res) => {
    try {
      const { name } = req.body;
  
      // Create the category in the database
      const category = await Category.create({ name });
  
      res.status(201).json(category);
    } catch (err) {
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

// Get all categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const products = await Category.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get category bu id
router.get('/categories/:id', authenticate,getCategory, async (req, res) => {
  try {
    res.json(res.category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Delete category by id
router.delete('/categories/:id', authenticate, getCategory, async (req, res) => {
  try{
    await Category.deleteOne({ _id: res.category._id });
    res.json({ message: 'Category deleted' });
  }catch (err){
    res.status(500).json({message: err.message});
  }
})

  
module.exports = router;
