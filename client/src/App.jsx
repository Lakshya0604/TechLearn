import { lazy, Suspense } from "react";
import LoadingSpinner from "./components/ui/LoadingSpinner";
const Login = lazy(() => import("./pages/Login"));
import HeroSection from "./pages/student/HeroSection";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { RouterProvider } from "react-router-dom";
import Courses from "./pages/student/Courses";
const MyLearning = lazy(() => import("./pages/student/MyLearning"));
const Profile = lazy(() => import("./pages/student/Profile"));
const Sidebar = lazy(() => import("./pages/admin/Sidebar"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const CourseTable = lazy(() => import("./pages/admin/course/CourseTable"));
const AddCourse = lazy(() => import("./pages/admin/course/AddCourse"));
const EditCourse = lazy(() => import("./pages/admin/course/EditCourse"));
const CreateLecture = lazy(() => import("./pages/admin/lectures/CreateLecture"));
const EditLecture = lazy(() => import("./pages/admin/lectures/EditLecture"));
const CourseDetail = lazy(() => import("./pages/student/CourseDetail"));
const CourseProgress = lazy(() => import("./pages/student/CourseProgress"));
const SearchPage = lazy(() => import("./pages/student/SearchPage"));
import { AdminRoute, AuthenticatedUser, ProtectedRoute } from "./components/ProtectedRoute";
import PurchaseCourseProtectedRoute from "./components/PurchaseCourseProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <div className="mx-auto max-w-xl p-8 text-center"><h1 className="text-2xl font-semibold">This page is unavailable</h1><p className="mt-3 text-muted-foreground">The link may have changed. Head back to TechLearn and try again.</p><a className="mt-6 inline-block text-primary underline" href="/">Back to home</a></div>,
    children: [
      {
        path: '/',
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        )

      },
      {
        path: '/login',
        element: <AuthenticatedUser><Login /></AuthenticatedUser>

      },
      {
        path: '/my-learning',
        element: <ProtectedRoute><MyLearning /></ProtectedRoute>
      },
      {
        path: '/profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: 'course/search',
        element: <SearchPage />
      },
      {
        path: 'course-detail/:courseId',
        element: <ProtectedRoute><CourseDetail /></ProtectedRoute>
      },
      {
        path: 'course-progress/:courseId',
        element: <ProtectedRoute><PurchaseCourseProtectedRoute><CourseProgress /></PurchaseCourseProtectedRoute></ProtectedRoute>
      },
      // admin routes start from here
      {
        path: 'admin',
        element: <AdminRoute><Sidebar /></AdminRoute>,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />
          },
          {
            path: 'course',
            element: <CourseTable />
          }
          , {
            path: 'course/create',
            element: <AddCourse />
          },
          {
            path: 'course/:courseId',
            element: <EditCourse />
          },
          {
            path: 'course/:courseId/lecture',
            element: <CreateLecture />
          },
          {
            path: 'course/:courseId/lecture/:lectureId',
            element: <EditLecture />
          },
        ]
      }
    ]
  },

])



export default function App() {
  return (
    <main>
      <ThemeProvider>
        <Suspense fallback={<LoadingSpinner />}><RouterProvider router={appRouter} /></Suspense>
      </ThemeProvider>
    </main>

  )
}
