import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Button } from '@mui/material';
import CustomAlert from '../components/UI/CustomAlert';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    const [totalPointCost, setTotalUserPointValue] = useState(false)

    const { getAccessTokenSilently } = useAuth0();
    const { user } = useUser();
    const { viewAs } = user;
    const navigate = useNavigate();

    const selectedOrgId = viewAs?.selectedOrgId

    // Find organization with the same orgId as selectedOrgId
    const selectedOrganization = viewAs?.organizations?.find(org => org.orgId === selectedOrgId);
    const pointValue = selectedOrganization?.pointValue




    const [cart, setCart] = useState(() => {
        // Retrieve cart data from localStorage on component mount
        const userId = viewAs?.userId
        const savedCart = localStorage.getItem(`cart_${userId}`);
        return savedCart ? JSON.parse(savedCart) : {};


    });



    useEffect(() => {
        // Update localStorage whenever cart changes
        console.log(cart)
        localStorage.setItem(`cart_${viewAs?.userId}`, JSON.stringify(cart));

        const newTotal = Object.keys(cart).reduce((total, productId) => {
            const cartItem = cart[productId];
            return total + (cartItem.price * cartItem.quantity);
        }, 0);
        setTotalUserPointValue(newTotal);
    }, [cart]);

    const addToCart = (productId) => {
        // Update cart state and localStorage
        const updatedCart = { ...cart, [productId]: (cart[productId] || 0) + 1 };
        setCart(updatedCart);
        localStorage.setItem(`cart_${viewAs?.userId}`, JSON.stringify(updatedCart));
    };

    const removeFromCart = (productId) => {
        // Remove item from cart
        const updatedCart = { ...cart };
        delete updatedCart[productId];
        setCart(updatedCart);
    };




    const handleBuyButtonClick = () => {

        if (pointValue < totalPointCost) {
            setShowErrorAlert(true)
        }
        else {
            console.log('Buy button clicked');
            //Wasn't sure what to do for the URL here. Should the URL be a concatenation of the productIDs of everything in the cart?
            navigate(`/purchase/${cart}`, {
                state: {
                    cart
                }
            }); // Navigate to '/purchase/:productId' route with props as state
        }
    };

    // Other functions to update or manage the cart

    return (
        <>
            {showErrorAlert && (
                <CustomAlert
                    type='error'
                    message='You do not have enough points to purchase this item'
                    onClose={() => setShowErrorAlert(false)}
                />
            )}



            <div>
                <h2>Shopping Cart</h2>

                {/* Render cart items and provide options to update cart */}
                {Object.keys(cart).map((productId) => (
                    <div key={productId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                        {/* Render item details */}
                        <img src={cart[productId].imageUrl} alt={cart[productId].title} style={{ maxWidth: '100px', maxHeight: '100px', marginRight: '10px', marginBottom: '10px' }} />
                        <div>
                            <p><strong>Title:</strong> {cart[productId].title}</p>
                            <p><strong>Quantity:</strong> {cart[productId].quantity}</p>
                            <p><strong>Point Value:</strong> {cart[productId].price}</p>
                        </div>
                        <button onClick={() => removeFromCart(productId)}>Remove</button>
                    </div>
                ))}
                <p><strong>Total Cost:</strong> {totalPointCost}</p>
                <p><strong>Your Points:</strong> {pointValue}</p>
                <Button
                    variant='contained'
                    color='secondary'
                    startIcon={<ShoppingCart />}
                    sx={{ mt: 1, ml: 1 }}
                    onClick={handleBuyButtonClick}
                >
                    Buy
                </Button>
            </div>
        </>

    );


};

export default CartPage;
