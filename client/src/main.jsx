// A deployment can retire a route chunk while a tab is still open.
window.addEventListener('vite:preloadError', event => {
  if (!sessionStorage.getItem('techlearn-chunk-reload')) {
    sessionStorage.setItem('techlearn-chunk-reload', '1');
    event.preventDefault();
    window.location.reload();
  }
});
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store as appStore } from './app/store'
import { Toaster } from 'sonner'
import { useLoadUserQuery } from './features/api/authApi'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Custom = ({ children }) => {
  const { isLoading } = useLoadUserQuery();
  return <>{isLoading ? <LoadingSpinner /> : <> {children}</>}</>
}


createRoot(document.getElementById('root')).render(

  <Provider store={appStore}> {/* Provide the Redux store to the entire app */}
    <Custom>
      <App />
      <Toaster position="top-right" richColors />
    </Custom>

  </Provider>

)
