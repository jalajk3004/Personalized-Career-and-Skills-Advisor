import { AuthProvider } from './AuthContext.tsx'
// import RootLayout from './layout/RootLayout.tsx'
import Auth from './pages/Auth.tsx'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage .tsx'
import GetRecommendation from './pages/getRecommendation.tsx'
// import { SidebarProvider } from './context/SidebarContext.tsx'
import CareerPage from './pages/careerForm/CareerPage.tsx'
import AIQuestionsPage from './pages/careerForm/AIQuestionsPage.tsx'
import Roadmap from './pages/roadmap.tsx'
import ProtectedRoute from './layout/ProtectedRoute.tsx'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      // <Route path='/' element={<RootLayout/>}>
      <Route>
        <Route path='/auth' element={<Auth/>}/>

        <Route element={<ProtectedRoute />}>
          <Route index element={<HomePage />} /> 
          <Route path="/career" element={<CareerPage />} />
          <Route path="/career/:userId/:recommendationId/ai-questions" element={<AIQuestionsPage />} />
          <Route path="/career/:userId/:recommendationId" element={<GetRecommendation />} />
          <Route path="/career/:userId/:recommendationId/roadmap/:title" element={<Roadmap />} />
        </Route>
      </Route>
    )
  )

  return (
    <AuthProvider>
      {/* <SidebarProvider> */}
        <RouterProvider router={router} />
      {/* </SidebarProvider>   */}
    </AuthProvider>
  )
}

export default App
