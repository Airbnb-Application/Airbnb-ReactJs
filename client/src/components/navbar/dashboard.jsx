import { useNavigate } from 'react-router-dom';
import ROUTES from '../../constants/routes';

const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <div className="hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer inset-y-0 right-0">
            <button onClick={() => navigate(ROUTES.DASHBOARD)}>Dashboard</button>
        </div>
    );
};

export default Dashboard;