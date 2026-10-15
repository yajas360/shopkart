import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            <Route element={<PublicRoute />}>
              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/login"
                element={<Login />}
              />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                path="/home"
                element={<Home />}
              />

              <Route
                path="/products"
                element={<Products />}
              />

              <Route
                path="/products/:id"
                element={<ProductDetails />}
              />

              <Route
                path="/wishlist"
                element={<Wishlist />}
              />

              <Route
                path="/cart"
                element={<Cart />}
              />

              <Route
                path="/checkout"
                element={<Checkout />}
              />

              <Route
                path="/order-success/:id"
                element={<OrderSuccess />}
              />

              <Route
                path="/orders"
                element={<Orders />}
              />

              <Route
                path="/orders/:id"
                element={<OrderDetails />}
              />
            </Route>

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;