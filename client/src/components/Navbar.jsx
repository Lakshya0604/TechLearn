import React, { useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "./ui/avatar";
import { Button } from "./ui/button";
import DarkMode from "../pages/DarkMode.jsx";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { useSelector } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { BookPlus } from "lucide-react";
import { toast } from "sonner";
import {
    Menu,
    School,
    User,
    BookOpen,
    LayoutDashboard,
    LogOut
} from "lucide-react";


const Navbar = () => {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const navigate = useNavigate();



    const logoutHandler = async () => {
        await logoutUser();
    }
    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "user logout");
            navigate("/login")
        }

    }, [isSuccess])
    return (
        <div className="h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 gap-2 duration-300 z-10  ">
            {/*Desktop Navbar*/}

            <div className="max-w-7xl mx-auto hidden md:flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-2">

                    <School size={30} />
                    <Link to="/">
                        <h1 className="hidden md:block text-xl font-bold">Tech learning</h1>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {
                        isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar>
                                        <AvatarImage src={user?.photoUrl || "https://github.com/shadcn.png"} alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                        <AvatarBadge className="bg-green-600 dark:bg-green-800" />
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40 bg-white shadow-md rounded-md p-2"
                                    align="end" sideOffset={5}>
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel >My Account</DropdownMenuLabel>
                                        {user?.role?.replace(/"/g, "") !== "instructor" && (
                                            <DropdownMenuItem>
                                                <Link to="my-learning">My Learning</Link>
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem>
                                            <Link to="profile">Edit Profile</Link>
                                        </DropdownMenuItem>

                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={logoutHandler

                                        }>
                                            logout
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    {user?.role?.replace(/"/g, "") === "instructor" && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/admin/dashboard">Dashboard</Link>
                                        </DropdownMenuItem>
                                    )}
                                    {/* {console.log(user.role)} */}




                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div>
                                <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
                                <Button onClick={() => navigate("/login")}>Sign Up</Button>
                            </div>
                        )
                    }
                    <DarkMode />
                </div>
            </div>
            {/*Mobile Navbar*/}
            <div className="md:hidden flex items-center justify-between px-4 h-full">
                <h1 className="text-xl font-bold"><Link to="/">E learning</Link></h1>
                <MobileNavbar />
            </div>

        </div>

    )
}

export default Navbar

const MobileNavbar = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [logoutUser] = useLogoutUserMutation();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            await logoutUser().unwrap();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                >
                    <Menu size={24} />
                </Button>
            </SheetTrigger>

            <SheetContent className="w-[300px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <School size={24} />
                        Tech Learning
                    </SheetTitle>
                </SheetHeader>

                <div className="mt-6">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center gap-3 border rounded-lg p-3 mb-6">
                                <Avatar>
                                    <AvatarImage
                                        src={
                                            user?.photoUrl ||
                                            "https://github.com/shadcn.png"
                                        }
                                    />
                                    <AvatarFallback>
                                        {user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <h3 className="font-semibold">
                                        {user?.name || "User"}
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-2">
                                {user?.role?.replace(/"/g, "") !== "instructor" && (
                                    <Link
                                        to="/my-learning"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition"
                                    >
                                        <BookOpen size={18} />
                                        My Learning
                                    </Link>
                                )}

                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition"
                                >
                                    <User size={18} />
                                    Edit Profile
                                </Link>

                                {user?.role?.replace(/"/g, "") === "instructor" && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition"
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </Link>
                                )}

                                {user?.role?.replace(/"/g, "") === "instructor" && (
                                    <Link
                                        to="/admin/course"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition"
                                    ><BookPlus size={18} />
                                        create Course
                                    </Link>
                                )}


                                <button
                                    onClick={logoutHandler}
                                    className="flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </nav>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </Button>

                            <Button
                                onClick={() => navigate("/login")}
                            >
                                Sign Up
                            </Button>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 left-6">
                    <DarkMode />
                </div>
            </SheetContent>
        </Sheet>
    );
};
