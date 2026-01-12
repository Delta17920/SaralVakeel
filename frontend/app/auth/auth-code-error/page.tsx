import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold mb-4">Authentication Error</h1>
            <p className="mb-8">There was an error authenticating your user.</p>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Return to Login
            </Link>
        </div>
    )
}
