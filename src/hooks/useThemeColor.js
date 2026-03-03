import { useLocation, useSearchParams } from 'react-router-dom';

export function useThemeColor() {
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const currentPath = location.pathname.toLowerCase();

    // Explicit employer routes that should always be purple
    const employerRoutes = [
        '/employer',
        '/find-cvs',
        '/products',
        '/resources',
        '/post-job',
        '/employer-dashboard'
    ];

    let isEmployerContext = employerRoutes.some(route => currentPath.startsWith(route));

    // Dynamic routes (Login / Register) determine role by query param
    if (currentPath === '/login' || currentPath === '/register') {
        if (searchParams.get('role') === 'employer') {
            isEmployerContext = true;
        }
    }

    if (isEmployerContext) {
        return {
            isEmployer: true,
            themeColor: '#CF9EFF',           // Main Purple
            themeHover: '#b880f0',           // Darker Purple
            themeBorder: 'border-[#CF9EFF]', // Tailwind border class
            themeText: 'text-[#CF9EFF]',     // Tailwind text class
            themeBg: 'bg-[#CF9EFF]',         // Tailwind bg class
        };
    }

    // Default to Student/JobSeeker context
    return {
        isEmployer: false,
        themeColor: '#5CB144',           // Main Green
        themeHover: '#4a8f37',           // Darker Green
        themeBorder: 'border-[#5CB144]', // Tailwind border class
        themeText: 'text-[#5CB144]',     // Tailwind text class
        themeBg: 'bg-[#5CB144]',         // Tailwind bg class
    };
}
