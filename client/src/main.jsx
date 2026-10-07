// A deployment can retire a route chunk while a tab is still open.
window.addEventListener('vite:preloadError', event => {
  if (!sessionStorage.getItem('techlearn-chunk-reload')) {
    sessionStorage.setItem('techlearn-chunk-reload', '1');
    event.preventDefault();
    window.location.reload();
  }
});
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {userLoggedIn, userLoggedout} from './features/authSlice'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store as appStore } from './app/store'
import { Toaster } from 'sonner'
import { useLoadUserQuery } from './features/api/authApi'
import LoadingSpinner from './components/ui/LoadingSpinner'

const Custom = ({ children }) => {
  const dispatch = useDispatch();
  const {data, error, isLoading} = useLoadUserQuery();
  useEffect(() => {
    if (data?.user) dispatch(userLoggedIn({user:data.user}));
    else if (error?.status === 401 || error?.status === 403) dispatch(userLoggedout());
  }, [data, error, dispatch]);
  return <>{isLoading ? <LoadingSpinner /> : children}</>
}


createRoot(document.getElementById('root')).render(

  <Provider store={appStore}> {/* Provide the Redux store to the entire app */}
    <Custom>
      <App />
      <Toaster position="top-right" richColors />
    </Custom>

  </Provider>

)
