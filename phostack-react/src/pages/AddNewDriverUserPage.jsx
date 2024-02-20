import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { createNewDriverUser } from '../util/users';
import { queryClient } from '../util/http';
import { useMutation } from '@tanstack/react-query';
import useUser from '../hooks/useUser';
import { useAuth0 } from '@auth0/auth0-react';
import CustomAlert from '../components/UI/CustomAlert';

const AddNewDriverUserPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const orgId = user?.orgId;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidations, setPasswordValidations] = useState({
    hasMinimumLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialCharacter: false,
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: createNewDriverUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'drivers', { orgId }],
      });
      setShowSuccessAlert(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPasswordError('');
      setPasswordValidations({
        hasMinimumLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialCharacter: false,
      });
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Password validation
    const hasMinimumLength = value.length >= 8;
    const hasLowercase = /[a-z]/.test(value);
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*]/.test(value);

    setPasswordValidations({
      hasMinimumLength,
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasSpecialCharacter,
    });

    const validations = [
      hasMinimumLength,
      hasLowercase,
      hasUppercase,
      hasNumber,
      hasSpecialCharacter,
    ];

    const validCount = validations.filter((valid) => valid).length;
    if (validCount < 3) {
      setPasswordError(
        'Password must contain at least 8 characters and include at least 3 of the following: lowercase letters, uppercase letters, numbers, special characters.'
      );
    } else {
      setPasswordError('');
    }
  };

  const renderValidationIcon = (validation, label) => {
    if (validation) {
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    } else {
      return <ErrorIcon color='disabled' />;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const userData = {
      firstName,
      lastName,
      email,
      password,
      userType: 'DriverUser',
      pointValue: 0
    };
    mutate({ orgId, userData, getAccessTokenSilently });
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Driver user create failed!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Driver user created sucessfully!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Typography variant='h4' component='h1'>
        Add Driver User
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin='normal'
          label='First Name'
          value={firstName}
          onChange={handleFirstNameChange}
          required
        />
        <TextField
          fullWidth
          margin='normal'
          label='Last Name'
          value={lastName}
          onChange={handleLastNameChange}
          required
        />
        <TextField
          fullWidth
          margin='normal'
          label='Email'
          type='email'
          value={email}
          onChange={handleEmailChange}
          required
        />
        <TextField
          fullWidth
          margin='normal'
          label='Password'
          type='password'
          value={password}
          onChange={handlePasswordChange}
          error={passwordError.length > 0}
          helperText={passwordError}
          required
        />
        <Box>
          <Stack direction='row' spacing={2} alignItems='center'>
            <FormControlLabel
              control={
                <Checkbox checked={passwordValidations.hasMinimumLength} />
              }
              label='At least 8 characters'
              disabled
            />
            {renderValidationIcon(passwordValidations.hasMinimumLength)}
          </Stack>
          <Stack direction='row' spacing={2} alignItems='center'>
            <FormControlLabel
              control={<Checkbox checked={passwordValidations.hasLowercase} />}
              label='Lower case letters (a-z)'
              disabled
            />
            {renderValidationIcon(passwordValidations.hasLowercase)}
          </Stack>
          <Stack direction='row' spacing={2} alignItems='center'>
            <FormControlLabel
              control={<Checkbox checked={passwordValidations.hasUppercase} />}
              label='Upper case letters (A-Z)'
              disabled
            />
            {renderValidationIcon(passwordValidations.hasUppercase)}
          </Stack>
          <Stack direction='row' spacing={2} alignItems='center'>
            <FormControlLabel
              control={<Checkbox checked={passwordValidations.hasNumber} />}
              label='Numbers (0-9)'
              disabled
            />
            {renderValidationIcon(passwordValidations.hasNumber)}
          </Stack>
          <Stack direction='row' spacing={2} alignItems='center'>
            <FormControlLabel
              control={
                <Checkbox checked={passwordValidations.hasSpecialCharacter} />
              }
              label='Special characters (e.g. !@#$%^&*)'
              disabled
            />
            {renderValidationIcon(passwordValidations.hasSpecialCharacter)}
          </Stack>
        </Box>
        <Button variant='contained' color='primary' type='submit'>
          Submit
        </Button>
      </form>
    </>
  );
};

export default AddNewDriverUserPage;
