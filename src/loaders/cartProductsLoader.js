import { getShoppingCart } from "../utilities/fakedb";

const cartProductsLoader = async () => {
    // if cart data is in database, you have to use async await
    const storedCart = getShoppingCart();
    const ids = Object.keys(storedCart)
    const loaderProducts = await fetch(`http://localhost:5000/productsByIds`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(ids)
    })

    const products = await loaderProducts.json();

    console.log('products by ID', products)


    console.log(storedCart)
    const savedCart = [];

    for (const id in storedCart) {
        const addedProduct = products.find(pd => pd._id === id);
        if (addedProduct) {
            const quantity = storedCart[id];
            addedProduct.quantity = quantity;
            savedCart.push(addedProduct);
        }
    }
    // if you need to send two things
    // return [products, savedCard];
    // another options 
    // return {products, savedCart}
    return savedCart;
}
export default cartProductsLoader;
