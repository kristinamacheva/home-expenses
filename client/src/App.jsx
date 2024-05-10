import { Routes, Route} from 'react-router-dom';

import Path from "./paths";

import Login from "./components/login/Login";
import Logout from "./components/logout/Logout";
import Register from "./components/register/Register";
import Sidebar from "./components/sidebar/Sidebar";
import HouseholdList from './components/household-list/HouseholdList';
import Home from './components/home/Home';
import HouseholdDetails from './components/household-details/HouseholdDetails';
import ExpenseDetails from './components/expense-details/ExpenseDetails';
import ExpenseList from './components/expense-list/ExpenseList';

function App() {
    return (
        <Routes>
            <Route path={Path.Home} element={<Sidebar />}>
                <Route index element={<Home />} />
                <Route path={Path.HouseholdList} element={<HouseholdList />} />
                <Route path={Path.HouseholdDetails} element={<HouseholdDetails /> } />
                <Route path={Path.Logout} element={<Logout />} />
            </Route>
            <Route path={Path.Login} element={<Login />} />
            <Route path={Path.Register} element={<Register />} />
        </Routes>
    );
}

export default App;
