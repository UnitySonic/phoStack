import Dashboard from '../components/dashboards/Dashboard';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import UploadButton from '../components/buttons/UploadButton';
import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query';
import useUser from '../hooks/useUser';
import { fetchPicture } from '../util/picture';

function ProfilePicturePage() {
    const { isAuthenticated } = useAuth0();
    const { user, isLoading: isUserLoading } = useUser();
    const { getAccessTokenSilently } = useAuth0();

    const userId = user?.userId;

    
    const {
        data: pictureData,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['picture', { userId }],
        queryFn: ({ signal }) =>
            fetchPicture({ userId, getAccessTokenSilently }),
        placeholderData: keepPreviousData,
        enabled: !!userId
    });


    return (
        <>
            {isAuthenticated && (
                <>
                    <h1>Upload a picture</h1>
                    <UploadButton />

                    {isLoading && <p>Loading...</p>}
                    {isError && <p>Error: {error.message}</p>}
                    {pictureData && (
                        <img src={pictureData} alt="User Picture" />
                    )}
                </>
            )}
        </>
    );
}


export default ProfilePicturePage;
