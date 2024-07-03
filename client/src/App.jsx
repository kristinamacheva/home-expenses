import { Routes, Route } from "react-router-dom";

import Path from "./paths";
import { AuthProvider } from "./contexts/authContext";

import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Sidebar from "./components/sidebar/Sidebar";
import HouseholdList from "./components/household-list/HouseholdList";
import Home from "./components/home/Home";
import HouseholdDetails from "./components/household-details/HouseholdDetails";
import NotFound from "./components/not-found/NotFound";
import Logout from "./components/logout/Logout";
import ProfileEdit from "./components/profile/profile-edit/ProfileEdit";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthGuard from "./components/guards/AuthGuard";
import GuestGuard from "./components/guards/GuestGuard";
import HouseholdInvitationList from "./components/household-invitation-list/HouseholdInvitationList";
import NotificationList from "./components/notification-list/NotificationList";
import { NotificationProvider } from "./contexts/notificationContext";

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <NotificationProvider>
                    <Routes>
                        <Route element={<AuthGuard />}>
                            <Route element={<Sidebar />}>
                                <Route path={Path.Home} element={<Home />} />
                                <Route
                                    path={Path.HouseholdList}
                                    element={<HouseholdList />}
                                />
                                <Route
                                    path={Path.HouseholdDetails}
                                    element={<HouseholdDetails />}
                                />
                                <Route
                                    path={Path.HouseholdInvitations}
                                    element={<HouseholdInvitationList />}
                                />
                                <Route
                                    path={Path.Profile}
                                    element={<ProfileEdit />}
                                />
                                <Route
                                    path={Path.Notifications}
                                    element={<NotificationList />}
                                />
                                <Route
                                    path={Path.Logout}
                                    element={<Logout />}
                                />
                            </Route>
                            <Route path="*" element={<NotFound />} />
                        </Route>
                        <Route element={<GuestGuard />}>
                            <Route path={Path.Login} element={<Login />} />
                            <Route
                                path={Path.Register}
                                element={<Register />}
                            />
                        </Route>
                    </Routes>
                </NotificationProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
