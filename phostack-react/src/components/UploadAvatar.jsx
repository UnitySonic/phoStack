import { Avatar } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savePicture } from '../util/picture';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import { useDropzone } from 'react-dropzone';

function AvatarWithUpload({ alt, picture, sx, editMode, onPicture }) {
    const queryClient = useQueryClient();

    const { getAccessTokenSilently } = useAuth0();
    const { user } = useUser();
    const { viewAs } = user;

    const { mutate } = useMutation({
        mutationFn: savePicture,
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
        onError: (error) => {
            console.log('Failed to upload picture:', error);
        },
    });

    const handleDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];

        const pictureData = new FormData();
        pictureData.append('file', file);
        pictureData.append('userId', viewAs?.userId);

        onPicture(pictureData);

    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: editMode ? handleDrop : undefined,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif'],
        },
    });

    return (
        <div {...getRootProps()} >
            <Avatar alt={alt} src={picture} sx={sx} />
            {editMode && <input {...getInputProps()} />}
        </div>
    );
}

export default AvatarWithUpload;
