import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'


const Shop = () => {
    const [products, setProducts] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [cart, setCart] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const { totalProducts } = useLoaderData();
    const totalpages = Math.ceil(totalProducts / itemsPerPage)

    const pageNumbers = [...Array(totalpages).keys()]

    /**
     * 1. done: determine the total number of items:
     * 2. TODO: decide on the number of items per page
     * 3. done: calculate the total number of pages
     * 4. Determine the current page
     * */


    // useEffect(() => {
    //     fetch('http://localhost:5000/products')
    //         .then(res => res.json())
    //         .then(data => setProducts(data))
    // }, [])

    useEffect(() => {
        async function fetchData () {
            const response = await fetch(`http://localhost:5000/products?page=${currentPage}&limit=${itemsPerPage}`);
            const data = await response.json();
            setProducts(data);
        }
        fetchData()
    }, [currentPage, itemsPerPage])

    useEffect(() => {
        const storedCart = getShoppingCart();
        const ids = Object.keys(storedCart);

        fetch(`http://localhost:5000/productsByIds`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(ids)
    })
    .then(res => res.json())
    .then(data => {
        console.log('only products in the shopping:', data)
    })

        const savedCart = [];

        // Step 1: get id of the addedProduct
        for (const id in storedCart) {
            //Step 3:  get product from products state by using id
            const addedProduct = products.find(product => product._id === id);
            if (addedProduct) {
                // step 3: add quantity
                const quantity = storedCart[id];
                addedProduct.quantity = quantity;
                // step 4: add the addedProduct to the saved cart
                savedCart.push(addedProduct)
            }
            console.log('added product', addedProduct)
        }
        // step 5: set the cart
        setCart(savedCart)

    }, [products])

    const handleAddToCart = (product) => {
        let newCart = [];

        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1;
        // if exist update quantity by 1

        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];

        }
        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }
    
    const options = [5, 10, 15, 20]
    function handleSelectChange(event) {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(0)
    }

    return (
        <>
            <div className='shop-container'>
                <div className="products-container">
                    {
                        products.map(product => <Product
                            key={product._id}
                            product={product}
                            handleAddToCart={handleAddToCart}
                        />)
                    }
                </div>
                <div className="cart-container">
                    <Cart
                        cart={cart}
                        handleClearCart={handleClearCart}
                    >
                        <Link className='proceed-link' to="/orders">
                            <button className='btn-proceed'><span>Review Order</span> <FontAwesomeIcon icon={faBook} /></button>
                        </Link>
                    </Cart>
                </div>
            </div>

            {/* pagination */}
            <div className='pagination'>
                <p>Current Page: {currentPage} and items per page: {itemsPerPage}</p>
                {
                    pageNumbers.map(number => <button
                        key={number}
                        className={currentPage === number ? 'selected': ''}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </button>)
                }
                <select value={itemsPerPage} onChange={handleSelectChange}>
                    {options.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
};

export default Shop;