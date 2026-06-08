import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Briefcase, Camera, Upload, X } from "lucide-react";
import Course from "./Course";

import { useLoadUserQuery, useUpdateUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { updateUser } from "@/features/authSlice";

const Profile = () => {

    const [name, setName] = useState("");
    const [profilephoto, setProfilePhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [open, setOpen] = useState(false)

    const { data, isLoading, isError, refetch } = useLoadUserQuery();
    const [updateUserMutation, { data: updateUserData, isLoading: updateUserIsLoading, error, isSuccess }] = useUpdateUserMutation();
    const dispatch = useDispatch();

    const onChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearPreview = () => {
        setPreviewUrl(null);
        setProfilePhoto(null);
    };

    useEffect(() => {
        refetch();

    }, []);

    useEffect(() => {
        if (isSuccess && updateUserData?.user) {
            // Update Redux state with new photoUrl so Navbar shows it immediately
            dispatch(updateUser({ photoUrl: updateUserData.user.photoUrl }));
            refetch();
            toast.success(updateUserData.message || "Profile updated successfully");
            setOpen(false); // Close the dialog
            setPreviewUrl(null);
            setProfilePhoto(null);
            setName("");
        }
        if (error) {
            toast.error(error.data?.message || "Failed to update profile");
        }
    }, [error, updateUserData, isSuccess, dispatch, refetch]);

    const updateUserHandler = async () => {
        const formData = new FormData();
        formData.append("name", name || user.name);
        formData.append("profilePhoto", profilephoto);
        await updateUserMutation(formData);
    }

    // loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    // error state
    if (isError || !data?.user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Profile</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Unable to fetch your profile information. Please try again.</p>
                    <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    const user = data && data.user;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and view your enrolled courses</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-800 dark:to-blue-600"></div>

                    {/* Profile Info */}
                    <div className="px-6 pb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16">
                            {/* Avatar */}
                            <div className="relative">
                                <Avatar className="h-32 w-32 md:h-40 md:w-40 ring-4 ring-white dark:ring-gray-800 shadow-xl">
                                    <AvatarImage src={user.photoUrl} alt={user.name} className="object-cover" />
                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-4xl font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-white dark:border-gray-800"></div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left pt-4 md:pt-16">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'instructor'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                        }`}>
                                        <Briefcase className="w-4 h-4 mr-1" />
                                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Edit Button */}
                            <div className="pt-4 md:pt-16">
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                                            <User className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
                                            <DialogDescription>
                                                Update your profile information below.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="flex flex-col gap-5 py-4">
                                            {/* Profile Photo Upload */}
                                            <div className="flex flex-col items-center">
                                                <div className="relative">
                                                    <Avatar className="h-24 w-24">
                                                        <AvatarImage
                                                            src={previewUrl || user.photoUrl}
                                                            alt="Profile preview"
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl font-bold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {previewUrl && (
                                                        <button
                                                            onClick={clearPreview}
                                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <Label className="mt-4 cursor-pointer">
                                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                                        <Camera className="w-4 h-4" />
                                                        <span>Change Profile Photo</span>
                                                    </div>
                                                    <input
                                                        onChange={onChangeHandler}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                    />
                                                </Label>
                                                {profilephoto && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {profilephoto.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Name Input */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Display Name
                                                </Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder={user.name}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => setOpen(false)}
                                                className="border-gray-300 dark:border-gray-600"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                disabled={updateUserIsLoading}
                                                onClick={updateUserHandler}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {updateUserIsLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.role === "instructor" ? "Created Courses" : "Enrolled Courses"}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {user?.role === "instructor"
                                    ? `${user?.createdCourses?.length || 0} courses created`
                                    : `${user?.enrolledCourses?.length || 0} courses enrolled`
                                }
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(() => {
                            // ✅ Pick correct list based on role
                            const courses = user?.role === "instructor"
                                ? user?.createdCourses
                                : user?.enrolledCourses;

                            return !courses || courses.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Briefcase className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {user?.role === "instructor" ? "No Courses Created" : "No Courses Enrolled"}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                        {user?.role === "instructor"
                                            ? "You haven't created any courses yet. Go to your dashboard to create one."
                                            : "You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you."
                                        }
                                    </p>
                                </div>
                            ) : (
                                courses.map((course) => (
                                    <Course course={course} key={course._id} />
                                ))
                            );
                        })()}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default Profile;