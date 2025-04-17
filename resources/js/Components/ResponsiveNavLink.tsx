import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    href,
    method,
    as = 'a',
    children,
}: {
    active?: boolean;
    href: string;
    method?: 'get' | 'post';
    as?: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            method={method}
            as={as}
            className={`block w-full pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground dark:text-white hover:border-gray-300 hover:text-gray-700'
            }`}
        >
            {children}
        </Link>
    );
}
