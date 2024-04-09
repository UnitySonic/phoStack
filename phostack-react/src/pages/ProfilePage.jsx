import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import Spinner from '../components/UI/Spinner';
import { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { changeUser } from '../util/users';
import { useMutation } from '@tanstack/react-query';
import CustomAlert from '../components/UI/CustomAlert';
import CancelIcon from '@mui/icons-material/Cancel';
import { savePicture } from '../util/picture';
import { queryClient } from '../util/http';

import AvatarWithUpload from '../components/UploadAvatar';
import { lightBlue } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import LockResetIcon from '@mui/icons-material/LockReset';

const ProfilePage = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const { viewAs } = user;
  const [editMode, setEditMode] = useState(false);
  const [firstNameField, setFirstNameField] = useState('');
  const [lastNameField, setLastNameField] = useState('');
  const { getAccessTokenSilently } = useAuth0();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isHovered, setIsHovered] = useState(false)
  const [currentPictureData, setCurrentPictureData] = useState(new FormData());

  const [saveNewPicture, setSaveNewPicture] = useState(false);





  const handlePictureDrop = (pictureData) => {
    // Set the profile picture state with the dropped picture data
    const newData = new FormData();
    newData.append('file', pictureData.get("file"));
    newData.append('userId', pictureData.get("userId"));
    setCurrentPictureData(newData);
    setSaveNewPicture(true);
  };







  const navigate = useNavigate();

  const {
    firstName = '',
    lastName = '',
    userType,
    userId,
    picture,
    email,
  } = viewAs || {};

  useEffect(() => {
    setFirstNameField(firstName);
    setLastNameField(lastName);
  }, [firstName, lastName]);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: changeUser,
    onSuccess: () => {
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const { mutate: savePictureMutate } = useMutation({
    mutationFn: savePicture,
    onSuccess: () => {
      queryClient.removeQueries(['users', { userId }]);
    },
    onError: (error) => {
      console.log('Failed to upload picture:', error);
    },
  });

  const handleSaveChanges = () => {
    if (userId) {
      mutate({
        userId,
        userData: { firstName: firstNameField, lastName: lastNameField },
        getAccessTokenSilently,
      });

      if (saveNewPicture) {
        console.log(currentPictureData.get("file"))
        savePictureMutate({ currentPictureData, getAccessTokenSilently })
        setSaveNewPicture(false)

      }


    } else {
      setShowErrorAlert(true);
    }
    setEditMode(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };
  const handleCancelChanges = () => {
    setEditMode(false);

  };

  const handleFirstNameChange = (event) => {
    setFirstNameField(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastNameField(event.target.value);
  };

  if (isUserLoading) {
    return <Spinner />;
  }

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message={`Something went wrong!`}
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message={`Success!`}
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Container maxWidth='sm'>
        <Box sx={{ mt: 4 }}>
          <AvatarWithUpload
            alt='Profile Picture'
            picture={picture}

            sx={{
              width: 150, height: 150, mx: 'auto',

            }}
            editMode={editMode}
            onPicture={handlePictureDrop}
          />
          {editMode && (
            <div style={{ textAlign: 'center' }}>Click Avatar to Change Profile Picture</div>
          )}

          <Typography variant='h5' align='center' gutterBottom>
            {firstNameField} {lastNameField}
          </Typography>
          <Box sx={{ mx: 'auto', width: 'fit-content' }}>
            <form onSubmit={handleSaveChanges}>
              <TextField
                id='firstName'
                label='First Name'
                variant='outlined'
                fullWidth
                sx={{ mb: 2 }}
                disabled={!editMode}
                onChange={handleFirstNameChange}
                value={firstNameField}
              />
              <TextField
                id='lastName'
                label='Last Name'
                variant='outlined'
                fullWidth
                sx={{ mb: 2 }}
                disabled={!editMode}
                onChange={handleLastNameChange}
                value={lastNameField}
              />
            </form>
            <TextField
              id='email'
              label='Email'
              value={email}
              variant='outlined'
              fullWidth
              sx={{ mb: 2 }}
              disabled
            />
            <TextField
              id='userId'
              label='User Id'
              value={userId}
              variant='outlined'
              fullWidth
              sx={{ mb: 2 }}
              disabled
            />
            <TextField
              id='user-type'
              label='User Type'
              value={userType}
              variant='outlined'
              fullWidth
              disabled
            />
            {editMode ? (
              <>

                <Button
                  color='error'
                  variant='contained'
                  onClick={handleCancelChanges}
                  startIcon={<CancelIcon />}
                  sx={{ mt: '1rem' }}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={handleSaveChanges}
                  startIcon={<SaveIcon />}
                  sx={{ mt: '1rem', ml: '1rem' }}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => navigate('/password-reset')}
                  startIcon={<LockResetIcon />}
                  sx={{ mt: '1rem', mr: '1rem' }}
                >
                  Reset Your Password
                </Button>
                <Button
                  variant='contained'
                  onClick={handleEditClick}
                  startIcon={<EditIcon />}
                  sx={{ mt: '1rem', mr: '1rem' }}
                >
                  Edit
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ProfilePage;
