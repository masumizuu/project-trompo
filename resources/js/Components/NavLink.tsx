import { Link } from '@inertiajs/react';

export default function NavLink({
    href,
    active,
    children,
}: {
    href: string;
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground dark:text-white hover:border-gray-300 hover:text-gray-700'
            }`}
        >
            {children}
        </Link>
    );
}
