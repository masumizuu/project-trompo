import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-secondary pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <img src="https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLANMxcFE3z2DIfTlPUCYsrNvO071GK4wjVQ9gB" alt="Trompo Logo" className="h-20 w-20 cursor-pointer" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-black px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
