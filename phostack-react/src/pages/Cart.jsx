import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { Button } from '@mui/material';
import CustomAlert from '../components/UI/CustomAlert';
import { useNavigate } from 'react-router-dom';
import { getCartId } from '../util/cart';
import { getCartItems } from '../util/cart';
import { getEbayItem } from '../util/ebay';
import Spinner from '../components/UI/Spinner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { modifyCart } from '../util/cart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Remove from '@mui/icons-material/Remove';
import priceConvert from '../util/priceConvert';


const CartPage = () => {

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [totalPointCost, setTotalPointCost] = useState(0);
    const [cartData, setCartData] = useState({}); // Initialize cartData as an empty object
    const [refetchFlag, setRefetchFlag] = useState(true)

    const { getAccessTokenSilently } = useAuth0();
    const { user } = useUser();
    const { viewAs } = user;
    const navigate = useNavigate();

    const orgId = viewAs?.selectedOrgId;

    // Find organization with the same orgId as selectedOrgId
    const selectedOrganization = viewAs?.organizations?.find(org => org.orgId === orgId);
    const pointValue = selectedOrganization?.pointValue;

    const userId = viewAs?.userId;

    let cartIdQueryParams = {
        orgId,
        userId,
    }

    const {
        data: cartId,
        isLoading: cartIdIsLoading,
        isError: cartIsIdError,
        error: cartIdError,
    } = useQuery({
        queryKey: ['cartId', cartIdQueryParams],
        queryFn: ({ signal }) =>
            getCartId({ signal, params: cartIdQueryParams, getAccessTokenSilently }),
    });


    let cartParams = {
        cartId,
    }

    const {
        data: queryCartData,
        isLoading: cartIsLoading,
        isError: cartIsError,
        error: cartError,
        refetch: refetchCartData, // Extract the refetch function
    } = useQuery({
        queryKey: ['cart', cartParams],
        queryFn: ({ signal }) =>
            getCartItems({ signal, params: cartParams, getAccessTokenSilently }),
        cacheTime: 0
    });

    // Now you can use refetchCartData to refetch the data whenever needed


    const { mutate, isPending, isSaveError, saveError, isSuccess } = useMutation({
        mutationFn: modifyCart,
        onSuccess: () => {
            setShowSuccessAlert(true);
        },
        onError: (error) => {
            //setShowErrorAlert(true);

        },
    });




    useEffect(() => {
        console.log("UserEffect Printing")
        console.log(queryCartData)
        console.log(cartData)
        console.log("Done in Effect Prints")

        if (queryCartData && Object.keys(cartData)?.length === 0 && Object.keys(queryCartData)?.length > 0) {
            setRefetchFlag(true)
        }
        else {
            setRefetchFlag(false)
        }


        if (!cartIsLoading && !cartIsError) {
            // Update cartData state when queryCartData changes
            Object.values(queryCartData).forEach(item => {
                item[0].price = priceConvert(item[0].price, selectedOrganization?.dollarPerPoint);
            });

            // Check if queryCartData is empty and trigger a refetch if needed
            if (refetchFlag === true) {
                refetchCartData();
            }
            // Set cartData state
            setCartData(queryCartData);

            // Calculate total cost whenever cartData or pointValue changes
            if (pointValue) {
                let cost = 0;
                Object.values(queryCartData).forEach(item => {
                    const price = item[0].price;
                    const quantity = item[0].quantity;
                    cost += price * quantity;
                });

                // Set totalPointCost state
                setTotalPointCost(cost);

                // Prepare cartInfo for mutation
                const cartInfo = {
                    cartId,
                    cartData: queryCartData
                };

                // Perform mutation
                mutate({ cartInfo, getAccessTokenSilently });

            }
        }
    }, [queryCartData, cartData]);






    const handleBuyButtonClick = () => {
        if (pointValue < totalPointCost) {
            setShowErrorAlert(true);
        } else {
            console.log('Buy button clicked');
            const cart = { ...cartData }


            navigate(`/purchase/${cartData}`, {
                state: {
                    cart,
                    clearCartFlag: true,
                    cartId: cartId
                }
            });
            console.log("we navigated")

        }
    };

    const increaseQuantity = (productId) => {
        const updatedCartData = { ...cartData };
        updatedCartData[productId][0].quantity = updatedCartData[productId][0].quantity + 1;
        setCartData(updatedCartData);
    }

    const decreaseQuantity = (productId) => {
        const updatedCartData = { ...cartData };
        updatedCartData[productId][0].quantity = updatedCartData[productId][0].quantity - 1;

        if (updatedCartData[productId][0].quantity <= 0) {
            updatedCartData[productId][0].quantity = 1
        }

        setCartData(updatedCartData);
    }

    const removeFromCart = (productId) => {

        const updatedCartData = { ...cartData };
        updatedCartData[productId][0].quantity = 0;
        setCartData(updatedCartData);


    };

    if (cartIdIsLoading || cartIsLoading) {
        return <Spinner />;
    }

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

                {Object.keys(cartData).map((productId) => {
                    const item = cartData[productId][0]; // Get the first item of the array
                    if (item.quantity > 0) {
                        return (
                            <div key={productId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                                <img src={item.imageUrl} alt={item.title} style={{ maxWidth: '100px', maxHeight: '100px', marginRight: '10px', marginBottom: '10px' }} />
                                <div>
                                    <p><strong>Title:</strong> {item.title}</p>
                                    <p><strong>Quantity:</strong> {item.quantity}</p>
                                    <p><strong>Point Value:</strong> {item.price}</p>
                                </div>
                                <button onClick={() => removeFromCart(productId)}>Remove</button>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 1, ml: 1 }}
                                    onClick={() => increaseQuantity(productId)}
                                >
                                </Button>
                                <Button
                                    variant='contained'
                                    color='warning'
                                    startIcon={<RemoveIcon />}
                                    sx={{ mt: 1, ml: 1 }}
                                    onClick={() => decreaseQuantity(productId)}
                                >
                                </Button>
                            </div>
                        );
                    } else {
                        return null; // Don't render if quantity is less than 0
                    }
                })}

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
