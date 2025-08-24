// import { useState } from 'react'

import RootLayout from './layout/RootLayout.tsx'
import Auth from './pages/Auth.tsx'
import {  Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>}>
        <Route path='/auth' element={<Auth/>}/>
      </Route>
    )
  )

  return (
    <div>
      <RouterProvider router={(router)}/>
      wassup
    </div>
  )
}

export default App
