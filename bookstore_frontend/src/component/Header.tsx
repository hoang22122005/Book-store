const Header = () => {
    return (

        <header className="fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center h-20 px-4 md:px-margin-desktop max-w-container-max mx-auto shadow-sm bg-surface text-body-lg font-body-md docked">
            <a href="{{DATA:SCREEN:SCREEN_17}}" className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-primary hover:opacity-80 transition-opacity">BookStore</a>

            {/* Navigation Links (Hidden on mobile for clarity, assumed search/cart intent)  */}
            <nav className="hidden md:flex items-center space-x-gutter">
                <a className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-200 active:opacity-80 scale-95 " href="#">Danh mục</a>
                <a className="text-on-surface-variant font-medium hover:text-secondary duration-200 active:opacity-80 scale-95 transition-all" href="#">Sách mới</a>
                <a className="text-on-surface-variant font-medium hover:text-secondary duration-200 active:opacity-80 scale-95 transition-all" href="#">Bán chạy</a>
                <a className="text-on-surface-variant font-medium hover:text-secondary duration-200 active:opacity-80 scale-95 transition-all" href="#">Khuyến mãi</a>
            </nav>

            <div className="flex items-center space-x-stack-md">
                <button className="text-primary hover:text-secondary duration-200 active:opacity-80 scale-95 transition-all flex items-center justify-center p-2">
                    <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
                </button>

                <button className="text-primary hover:text-secondary duration-200 active:opacity-80 scale-95 transition-all flex items-center justify-center p-2">
                    <span className="material-symbols-outlined" data-icon="person">person</span>
                </button>
            </div>
        </header>

    );
}

export default Header;