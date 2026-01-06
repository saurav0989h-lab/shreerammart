import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import ScrollToTop from "@/components/ui/ScrollToTop"

function App() {
  return (
    <>
      <Pages />
      <ScrollToTop />
      <Toaster />
    </>
  )
}

export default App 