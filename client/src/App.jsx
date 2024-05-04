import { Routes, Route} from 'react-router-dom';

import Path from "./paths";

import Login from "./components/login/Login";
import Logout from "./components/logout/Logout";
import Register from "./components/register/Register";
import Sidebar from "./components/sidebar/Sidebar";

function App() {
    return (
        <Routes>
            <Route path={Path.Home} element={<Sidebar />} />
            <Route path={Path.Login} element={<Login />} />
            <Route path={Path.Logout} element={<Logout />} />
            <Route path={Path.Register} element={<Register />} />
        </Routes>
    );
}

export default App;
