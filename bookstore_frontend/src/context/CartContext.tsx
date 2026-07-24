import React, { useState, useEffect, createContext, useContext } from "react";

export interface CartItem extends Item {
    quantity: number
}

export interface Item {
    bookId: number,
    name: string,
    price: number,
    author: string
}

interface CartContextType {
    cart: CartItem[],
    isError: string,
    addToCart: (item: Item) => void,
    removeFromCart: (bookId: number) => void,
    decreaseItem: (bookId: number) => void,
    clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [isError, setIsError] = useState<string>("");

    const [cart, setCart] = useState<CartItem[]>(() => { // khi có check user đăng nhập thì cần bổ sung khi lấy từ backend
        const localCart = localStorage.getItem("cart");
        return localCart ? JSON.parse(localCart) : [];
    });

    const addToCart = (item: Item) => {
        setCart((preCart) => {
            const existingCartDetail = preCart.findIndex((cartDetail) => cartDetail.bookId === item.bookId);

            if (existingCartDetail !== -1) {
                const updatedCart = preCart.map((cartDetail, index) =>
                    index === existingCartDetail
                        ? { ...cartDetail, quantity: cartDetail.quantity + 1 }
                        : cartDetail
                );
                return updatedCart;
            } else {
                const updatedCart = [...preCart, { ...item, quantity: 1 }];
                return updatedCart;
            }
        });
    }

    const removeFromCart = (bookId: number) => {
        setCart((preCart) => {
            const updatedCart = preCart.filter((CartDetail) => CartDetail.bookId !== bookId);
            return updatedCart;
        });
    }

    const clearCart = () => {
        setCart([]);
    }

    const decreaseItem = (bookId: number) => {
        setCart((preCart) => {
            const updatedCart = preCart.map((cartDetail) =>
                cartDetail.bookId === bookId
                    ? { ...cartDetail, quantity: cartDetail.quantity - 1 }
                    : cartDetail
            ).filter((cartDetail) => cartDetail.quantity > 0);

            return updatedCart;
        });
    }

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    return (
        <CartContext.Provider value={{ cart, isError, addToCart, removeFromCart, clearCart, decreaseItem }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart phai duoc dung ben trong the boc CartProvider");
    }
    return context;
}

export default CartProvider;