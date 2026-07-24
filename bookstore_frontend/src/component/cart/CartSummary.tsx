import { useMemo } from "react";
import { useCart } from "../../context/CartContext";

const CartSummary = () => {
    const { cart } = useCart();

    const originTotal = useMemo(() => {
        return cart.reduce((total, cartItem) => total + cartItem.price * cartItem.quantity, 0); 
    }, [cart]);

    const discount = 0;

    const totalAmount = originTotal - discount;

    return (

        <div className="lg:col-span-4 sticky-summary">
            <div className="bg-surface-container-lowest rounded-lg p-stack-md book-card-shadow flex flex-col gap-stack-md">
                <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container-highest pb-stack-sm">Tổng đơn hàng</h2>
                <div className="space-y-stack-sm font-body-md text-body-md text-on-surface-variant">
                    <div className="flex justify-between">
                        <span className="">Tạm tính</span>
                        <span className="font-medium text-primary">{originTotal}</span>
                    </div>
                    <div className="flex justify-between text-secondary">
                        <span className="">Giảm giá</span>
                        <span className="">{discount * -1}</span>
                    </div>
                </div>
                <div className="border-t border-surface-container-highest pt-stack-sm flex justify-between items-end">
                    <span className="font-body-lg text-body-lg text-primary font-medium">Tổng tiền</span>
                    <div className="text-right">
                        <span className="font-headline-md text-headline-md text-secondary-container font-bold block">{totalAmount}</span>
                    </div>
                </div>
                <a href="{{DATA:SCREEN:SCREEN_20}}" className="w-full bg-secondary-container text-on-secondary-container font-label-md text-label-md py-3 px-6 rounded-lg font-bold hover:bg-secondary-fixed-dim transition-colors mt-stack-sm shadow-sm block text-center">Tiến hành đặt hàng</a>
            </div>
        </div>

    );
}

export default CartSummary;