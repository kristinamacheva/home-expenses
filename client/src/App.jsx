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

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path={Path.Home} element={<Sidebar />}>
                    <Route index element={<Home />} />
                    <Route
                        path={Path.HouseholdList}
                        element={<HouseholdList />}
                    />
                    <Route
                        path={Path.HouseholdDetails}
                        element={<HouseholdDetails />}
                    />
                    <Route path={Path.Logout} element={<Logout />} />
                </Route>
                <Route path={Path.Login} element={<Login />} />
                <Route path={Path.Register} element={<Register />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
