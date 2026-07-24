interface CartDetailProps {
    author: string,
    price: number | string,
    bookName: string,
    quantity: number
}

const CartDetail = ({author, price, bookName, quantity}: CartDetailProps) => {
    return (

        <div className="bg-surface-container-lowest rounded-lg p-stack-md book-card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-stack-md relative">
            <div className="w-24 h-32 shrink-0 border border-surface-container-high bg-surface-container-low rounded flex items-center justify-center overflow-hidden">
                <img className="w-full h-full object-cover" data-alt="A detailed, modern book cover for a business book. Minimalist design with deep blue and warm orange accents. Professional lighting, high resolution." src="https:{/*lh3.googleusercontent.com/aida-public/AB6AXuCYrt7-bdAN9eQLuQUnmAQOtkK-gXdQdVI8lkvIoma5CFwxWD4HckRhkExutsoVlBMLD7Wf_ZLtZY80LflDE-44E9KQJFx4JyAhQySk2kkp0hKacobv9-t8TXqxSeG_ti1CKqURxJ3px3XI6_cO0QarOKb6FHEsoPIDht4ACZg4NEEfHXADiaEIenjR5-E4Y6FyFXndWzf1OMy-qY-RodnUuLc2aI4RT9getb1xMEfpkTOS1kZDQlc" />
            </div>
            <div className="grow">
                <h3 className="font-headline-md text-body-lg text-primary line-clamp-2"><a href="{{DATA:SCREEN:SCREEN_5}}" className="hover:text-secondary transition-colors">{bookName}</a></h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-unit">{author}</p>
                <div className="mt-stack-sm flex items-baseline gap-2">
                    <span className="font-caption text-caption text-outline line-through">{price}</span>
                </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-stack-md sm:gap-stack-sm">
                {/* Quantity Stepper  */}
                <div className="flex items-center border-1.5 border-outline-variant rounded bg-surface-container-lowest">
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="remove">remove</span>
                    </button>
                    <input className="w-10 text-center border-none font-body-md text-body-md text-primary bg-transparent focus:ring-0 p-0" readOnly type="text" value={quantity} />
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                    </button>
                </div>
                {/* Remove Icon  */}
                <button className="text-outline hover:text-error transition-colors flex items-center">
                    <span className="material-symbols-outlined" data-icon="delete">delete</span>
                </button>
            </div>
        </div>

    );
}

export default CartDetail;