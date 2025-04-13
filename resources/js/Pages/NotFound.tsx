import { Head } from '@inertiajs/react';

export default function NotFound() {
    return (
        <>
            <Head title="404 Not Found" />
            <div
                className="min-h-screen bg-cover bg-center flex flex-col justify-between text-white"
                style={{
                    backgroundImage:
                        "url('https://6v5e0ohgur.ufs.sh/f/MOFsf8KgsHLAcCX2f3LG5yhYqkwZfaE40lrMzR2dbuLng8H9')", // replace with your preferred image
                }}
            >
                {/* Top */}
                <div className="flex justify-center items-start pt-20 text-6xl font-bold">
                    404
                </div>

                {/* Middle (optional, left empty to split screen evenly) */}
                <div />

                {/* Bottom */}
                <div className="flex justify-center items-end pb-20 text-lg">
                    <p className="bg-black/60 px-4 py-2 rounded text-center">
                        What you're looking for isn't here. Maybe{' '}
                        <a href="/" className="underline hover:text-gray-300">
                            go back to the homepage
                        </a>{' '}
                        and try again?
                    </p>
                </div>
            </div>
        </>
    );
}
