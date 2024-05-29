import { useEffect } from 'react';
import * as authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import Path from '../../paths';

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        authService.logout()
            .then(() => {
                navigate(Path.Home);
            })
            .catch(() => navigate(Path.Home));
    }, [])

    return null;
}