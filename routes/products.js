const express = require('express');
const router = express.Router();

// require in the model
const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');

router.get('/', async function(req,res){
    // use the Product model to get all the products
    const products = await Product.collection().fetch({
        withRelated:['category', 'tags']
    });
    // products.toJSON() convert the table rows into JSON data format
    res.render('products/index', {
        products: products.toJSON()
    } );
});

router.get('/add-product', async function(req,res){

    // get all the categories
    const allCategories = await Category.fetchAll().map( category => [ category.get('id'), category.get('name')]);

    // get all the tags 
    const allTags = await Tag.fetchAll().map (t => [t.get('id'), t.get('name')]);

    const productForm = createProductForm(allCategories, allTags);
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    })
});

router.post('/add-product', function(req,res){
    // create the product form object using caolan form
    const productForm = createProductForm();
    // using the form object to handle the request
    productForm.handle(req, {
        'success': async function(form) {
            // the forms has no error
            // to access each field in the submitted form
            // we use form.data.<fieldname>


            // create an instance of the Product model
            // an instance of a product is one row in the corresponding table
            const product = new Product();
            product.set('name', form.data.name)
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('category_id', form.data.category_id)
            // save the product to the database
            await product.save();

            // same as:
            // INSERT INTO products (name, cost, description)
            // VALUES (${form.data.name}, ${form.data.cost}, ${form.data.description})
           
            // save the tags relationship
            if (form.data.tags) {
                // form.data.tags will be a string of the selected tag ids seperated by comma
                // eg: "1,2"
                await product.tags().attach(form.data.tags.split(','));
            }
            
            res.redirect("/products/");
        },
        'empty': function(form) {
            // the user submitted an empty form
            res.render('products/create', {
                form: productForm.toHTML(bootstrapField)
            })
        },
        'error': function(form) {
            // the user submitted a form with error
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
});

router.get('/update-product/:productId', async function(req,res){
    const productId = req.params.productId;

    // fetch the product that we want to update
    // emulate: SELECT * from products WHERE id = ${productId}
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    // get all the categories
      // get all the categories
      const allCategories = await Category.fetchAll().map( category => [ category.get('id'), category.get('name')]);

    // create the product form
    const productForm = createProductForm(allCategories);

    // prefill the form with values from the product 
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.category_id.value = product.get('category_id');

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
});

router.post('/update-product/:productId', async function(req,res){
    // 1. create the form object
    const productForm = createProductForm();

    // 2. use the form object to handle the request
    productForm.handle(req, {
        'success':async function(form) {
            // find the product that the user want to modify
            const product = await Product.where({
                'id': req.params.productId
            }).fetch({
                require: true  // make sure the product actually exists
            });

            // if every key in form.data is one column in a product row,
            // we can use the following shortcut:
            product.set(form.data);
            await product.save();
            res.redirect('/products/')
        },
        'empty': function(form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField)
            })
        },
        'error': function(form) {
            res.render('products/update', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/delete-product/:productId', async function(req,res){
    const product = await Product.where({
        'id': req.params.productId
    }).fetch({
        required: true
    });

    res.render('products/delete', {
        product: product.toJSON()
    })

})

router.post('/delete-product/:productId', async function(req,res){
    // get the product which we want to delete
    const product = await Product.where({
        'id': req.params.productId
    }).fetch({
        required: true
    });

    await product.destroy();
    res.redirect('/products');


})

// export
module.exports = router;