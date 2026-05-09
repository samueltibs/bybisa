import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Loading from './components/ui/Loading'

const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'))
const DownloadPage = lazy(() => import('./pages/Download'))
const MyPurchases = lazy(() => import('./pages/MyPurchases'))
const About = lazy(() => import('./pages/About'))
const Admin = lazy(() => import('./pages/admin/Admin'))

export default function App() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/download/:token" element={<DownloadPage />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </Suspense>
  )
}
