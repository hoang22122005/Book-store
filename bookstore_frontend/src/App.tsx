import './App.css'
import CartPage from "./pages/CartPage"
import CartContext from "./context/CartContext"

function App() {

  return (
    <>
      <CartContext>
        <CartPage></CartPage>
      </CartContext>
    </>
  )
}

export default App
