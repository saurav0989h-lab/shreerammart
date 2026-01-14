import Layout from "./Layout.jsx";

import Home from "./Home";

import Products from "./Products";

import Cart from "./Cart";

import Checkout from "./Checkout";

import OrderConfirmation from "./OrderConfirmation";

import About from "./About";

import Contact from "./Contact";

import AdminDashboard from "./AdminDashboard";

import AdminLogin from "./AdminLogin";

import AdminOrders from "./AdminOrders";

import AdminProducts from "./AdminProducts";

import AdminCategories from "./AdminCategories";

import OrderTracking from "./OrderTracking";

import UserProfile from "./UserProfile";

import AdminStores from "./AdminStores";

import ProductDetail from "./ProductDetail";

import AdminReviews from "./AdminReviews";

import AdminDeliverySettings from "./AdminDeliverySettings";


import AdminCustomers from "./AdminCustomers";

import AdminPaymentSettings from "./AdminPaymentSettings";

import AdminShoppingLists from "./AdminShoppingLists";

import AdminPromotions from "./AdminPromotions";

import AdminHomepage from "./AdminHomepage";

import MyShoppingLists from "./MyShoppingLists";

import Login from "./Login";

import Signup from "./Signup";

import AdminSettings from "./AdminSettings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Home: Home,

    Products: Products,

    Cart: Cart,

    Checkout: Checkout,

    OrderConfirmation: OrderConfirmation,

    About: About,

    Contact: Contact,

    AdminDashboard: AdminDashboard,

    AdminLogin: AdminLogin,

    AdminOrders: AdminOrders,

    AdminProducts: AdminProducts,

    AdminCategories: AdminCategories,

    OrderTracking: OrderTracking,

    UserProfile: UserProfile,

    AdminStores: AdminStores,

    ProductDetail: ProductDetail,

    AdminReviews: AdminReviews,

    AdminDeliverySettings: AdminDeliverySettings,

    AdminCustomers: AdminCustomers,

    AdminPaymentSettings: AdminPaymentSettings,

    AdminShoppingLists: AdminShoppingLists,

    AdminPromotions: AdminPromotions,

    AdminHomepage: AdminHomepage,

    MyShoppingLists: MyShoppingLists,

    Login: Login,

    Signup: Signup,

    AdminSettings: AdminSettings,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                <Route path="/" element={<Home />} />


                <Route path="/Home" element={<Home />} />

                <Route path="/Products" element={<Products />} />

                <Route path="/Cart" element={<Cart />} />

                <Route path="/Checkout" element={<Checkout />} />

                <Route path="/OrderConfirmation" element={<OrderConfirmation />} />

                <Route path="/About" element={<About />} />

                <Route path="/Contact" element={<Contact />} />

                <Route path="/admindashboard" element={<AdminDashboard />} />

                <Route path="/adminlogin" element={<AdminLogin />} />

                <Route path="/adminorders" element={<AdminOrders />} />

                <Route path="/adminproducts" element={<AdminProducts />} />

                <Route path="/admincategories" element={<AdminCategories />} />

                <Route path="/ordertracking" element={<OrderTracking />} />

                <Route path="/userprofile" element={<UserProfile />} />

                <Route path="/adminstores" element={<AdminStores />} />

                <Route path="/productdetail" element={<ProductDetail />} />

                <Route path="/adminreviews" element={<AdminReviews />} />

                <Route path="/admindeliverysettings" element={<AdminDeliverySettings />} />

                <Route path="/adminshoppinglists" element={<AdminShoppingLists />} />

                <Route path="/admincustomers" element={<AdminCustomers />} />

                <Route path="/adminpaymentsettings" element={<AdminPaymentSettings />} />

                <Route path="/adminshoppinglists" element={<AdminShoppingLists />} />

                <Route path="/adminsettings" element={<AdminSettings />} />

                <Route path="/adminpromotions" element={<AdminPromotions />} />

                <Route path="/adminhomepage" element={<AdminHomepage />} />

                <Route path="/MyShoppingLists" element={<MyShoppingLists />} />

                <Route path="/Login" element={<Login />} />

                <Route path="/Signup" element={<Signup />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}