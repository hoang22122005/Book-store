import Header from "../component/Header";
import Footer from "../component/Footer";
import CartDetail from "../component/cart/CartDetail";
import CartSummary from "../component/cart/CartSummary";
import { useCart } from "../context/CartContext";

const CartPage = () => {
    const { cart } = useCart();

    if (cart.length === 0) {
        return (
            <div>
                <Header></Header>

                {/* Main Content Canvas  */}
                <main className="grow pt-24 pb-stack-lg px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
                    {/* Page Title  */}
                    <div className="mb-stack-lg flex justify-start">
                        <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl text-primary">Giỏ hàng của bạn</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                        
                        <div className="lg:col-span-8 space-y-stack-md">
                            <div className="flex-col items-center justify-center py-stack-lg text-center bg-surface-container-lowest rounded-lg book-card-shadow mt-stack-lg">
                                <span className="material-symbols-outlined text-6xl text-surface-variant mb-stack-md" data-icon="shopping_basket">shopping_basket</span>
                                <h3 className="font-headline-md text-headline-md text-primary mb-unit">Giỏ hàng của bạn đang trống</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">Hãy chọn thêm sách để lấp đầy giỏ hàng nhé.</p>
                                <button className="border-2 border-primary text-primary font-label-md text-label-md py-2 px-6 rounded-lg font-bold hover:bg-primary-fixed transition-colors">
                                    Quay lại mua sắm
                                </button>
                            </div>
                        </div>
                        
                        <CartSummary></CartSummary>

                    </div>
                </main>

                <Footer></Footer>
            </div>
        );
    }

    return (
        <div>
            <Header></Header>

            {/* Main Content Canvas  */}
            <main className="grow pt-24 pb-stack-lg px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
                {/* Page Title  */}
                <div className="mb-stack-lg flex justify-start">
                    <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl text-primary">Giỏ hàng của bạn</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    {/* Cart Items List (Left / Main Column)  */}
                    <div className="lg:col-span-8 space-y-stack-md">
                        {/* Item  */}
                        {
                            cart.map(item => (
                                <CartDetail
                                    key={item.bookId}
                                    bookName={item.name}
                                    author={item.author}
                                    price={item.price}
                                    quantity={item.quantity}
                                />
                            ))
                        }

                    </div>
                    {/* Order Summary Card (Right Column)  */}
                    <CartSummary></CartSummary>

                </div>
            </main>

            <Footer></Footer>
        </div>
    );
}

export default CartPage;