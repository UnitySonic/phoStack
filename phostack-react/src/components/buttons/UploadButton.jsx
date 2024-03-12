import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savePicture } from '../../util/picture';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../../hooks/useUser';

function UploadButton({ onUpload }) {
  const queryClient = useQueryClient();

  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs } = user;

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: savePicture,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.log('We failed');
    },
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      console.log('Handle Drop Ran');
      const pictureData = new FormData();
      pictureData.append('file', file);
      pictureData.append('userId', viewAs?.userId);

      console.log(pictureData);

      mutate({ pictureData, getAccessTokenSilently });

      if (onUpload) {
        //onUpload(file);
      }
    },
    [onUpload, mutate, viewAs, getAccessTokenSilently]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
  });

  return (
    <div {...getRootProps()} style={styles}>
      <input {...getInputProps()} />
      <p>Click to to change your profile picture</p>
    </div>
  );
}

const styles = {
  width: '200px', // Adjust the width of the button
  height: '120px',
  border: '2px dashed #ccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default UploadButton;
