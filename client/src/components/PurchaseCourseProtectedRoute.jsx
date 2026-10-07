import { useGetCourseDetailWithStatusQuery, useVerifyPaymentMutation } from '@/features/api/purchaseApi';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageState from './PageState';
export default function PurchaseCourseProtectedRoute({children}) {
  const {courseId} = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const {data, isLoading, isError, refetch} = useGetCourseDetailWithStatusQuery(courseId);
  const [verify] = useVerifyPaymentMutation();
  const [checkedSession, setCheckedSession] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    verify({sessionId, courseId}).unwrap().then(() => refetch()).catch(error => {
      if (active) setPaymentError(error?.data?.message || 'We could not confirm your payment. Please try again.');
    }).finally(() => {if (active) setCheckedSession(sessionId);});
    return () => {active = false;};
  }, [sessionId, courseId, verify, refetch]);
  if (isLoading || (sessionId && checkedSession !== sessionId)) return <div className="mx-auto max-w-3xl p-6"><PageState loading title={sessionId ? 'Confirming your enrollment' : 'Loading your course'} /></div>;
  if (isError || paymentError) return <div className="mx-auto max-w-3xl p-6"><PageState error title="Course access couldn't load" description={paymentError} onRetry={() => window.location.reload()} /></div>;
  return data?.purchased ? children : <Navigate replace to={`/course-detail/${courseId}`} />;
}
