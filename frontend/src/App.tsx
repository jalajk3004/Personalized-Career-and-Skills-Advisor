import { AuthProvider } from './AuthContext.tsx'
import RootLayout from './layout/RootLayout.tsx'
import Auth from './pages/Auth.tsx'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage .tsx'
import CareerOption from './components/careerOption.tsx'
import { SidebarProvider } from './context/SidebarContext.tsx'
import CareerPage from './pages/careerForm/CareerPage.tsx'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>}>
        <Route index element={<HomePage />} /> 
        <Route path='/auth' element={<Auth/>}/>
        <Route path="/career" element={<CareerPage />} />
        <Route path="/career/:userId/:recommendationId" element={<CareerOption />} />
      </Route>
    )
  )

  return (
    <AuthProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
