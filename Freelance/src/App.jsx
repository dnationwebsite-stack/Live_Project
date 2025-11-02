import { Routes, Route, useLocation } from "react-router-dom"
import Home from "./User/pages/Home"
import Auth from "./User/pages/Auth"
import Otp from "./User/components/otp"
import Navbar from "./User/components/Navbar"
import CartList from "./User/pages/CartList"
import ProductDetailPage from "./User/pages/ProductDetailPage"
import Footer from "./User/components/Footer"
// import  {AdminDashboard}  from "./Admin/pages/AdminDashboard"
import ProfilePage from "./User/pages/ProfilePage"
import OrderPage from "./User/pages/OrderPage"

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/admin" element={<AdminDashboard/>} /> */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/cartpage" element={<CartList />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/detailpage/:id" element={<ProductDetailPage />} />

      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
