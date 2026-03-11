import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

// Admin email - only this user can access admin panel
const ADMIN_EMAIL = 'sugus7215@gmail.com';

export const isAdminEmail = (email) => {
    return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const useIsAdmin = () => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return { isAdmin: false, isLoading: true };
    if (!user) return { isAdmin: false, isLoading: false };

    const userEmail = user.primaryEmailAddress?.emailAddress;
    return {
        isAdmin: isAdminEmail(userEmail),
        isLoading: false,
        email: userEmail
    };
};

const AdminProtectedRoute = ({ children }) => {
    const { user, isLoaded } = useUser();

    // Show loading state while Clerk is loading
    if (!isLoaded) {
        return (
            <div className="admin-loading">
                <div className="loader"></div>
                <p>Verifying access...</p>
            </div>
        );
    }

    // If not signed in, show sign in prompt
    if (!user) {
        return (
            <div className="access-denied">
                <div className="access-denied-content">
                    <h1>🔒 Admin Access Required</h1>
                    <p>Please sign in with an admin account to access this page.</p>
                    <SignedOut>
                        <RedirectToSignIn />
                    </SignedOut>
                </div>
            </div>
        );
    }

    // Check if user is admin
    const userEmail = user.primaryEmailAddress?.emailAddress;
    const isAdmin = isAdminEmail(userEmail);

    if (!isAdmin) {
        return (
            <div className="access-denied">
                <div className="access-denied-content">
                    <h1>⛔ Access Denied</h1>
                    <p>You do not have permission to access the admin panel.</p>
                    <p className="user-email">Signed in as: {userEmail}</p>
                    <a href="/" className="btn btn-primary">Go to Home</a>
                </div>
                <style>{`
                    .access-denied {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--color-bg-primary);
                        padding: 2rem;
                    }
                    .access-denied-content {
                        text-align: center;
                        max-width: 500px;
                    }
                    .access-denied h1 {
                        font-size: 2.5rem;
                        margin-bottom: 1rem;
                    }
                    .access-denied p {
                        color: var(--color-text-secondary);
                        margin-bottom: 0.5rem;
                    }
                    .access-denied .user-email {
                        font-size: 0.9rem;
                        color: var(--color-text-muted);
                        margin-bottom: 2rem;
                    }
                    .admin-loading {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 1rem;
                    }
                `}</style>
            </div>
        );
    }

    // User is admin, render children
    return <SignedIn>{children}</SignedIn>;
};

export default AdminProtectedRoute;
