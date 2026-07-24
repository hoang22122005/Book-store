const Footer = () => {
    return (

        <footer className="bg-surface-container-low font-caption text-body-md full-width bottom border-t-2 border-outline-variant w-full py-stack-lg px-4 md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter mt-stack-lg">
            <div className="col-span-1 md:col-span-4 flex flex-col md:flex-row justify-between items-center gap-stack-md">
                <div className="font-headline-md text-headline-md text-primary ">
                    BookStore
                </div>
                
                <nav className="flex flex-wrap justify-center md:justify-end gap-stack-md text-on-surface-variant">
                    <a className="hover:text-primary  underline transition-all focus:ring-2 focus:ring-primary" href="#">Về chúng tôi</a>
                    <a className="hover:text-primary  underline transition-all focus:ring-2 focus:ring-primary" href="#">Chính sách bảo mật</a>
                    <a className="hover:text-primary  underline transition-all focus:ring-2 focus:ring-primary" href="#">Điều khoản sử dụng</a>
                    <a className="hover:text-primary  underline transition-all focus:ring-2 focus:ring-primary" href="#">Hướng dẫn mua hàng</a>
                    <a className="hover:text-primary  underline transition-all focus:ring-2 focus:ring-primary" href="#">Liên hệ</a>
                </nav>
            </div>
            
            <div className="col-span-1 md:col-span-4 text-center mt-stack-sm border-t-2 border-surface-variant pt-stack-md md:pb-none md:mt-margin-desktop text-on-surface-variant font-caption text-caption">
                Dự án Thực tập A2M.
            </div>
        </footer>

    );
}

export default Footer;