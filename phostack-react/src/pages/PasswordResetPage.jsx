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
import { useMutation } from '@tanstack/react-query';
import useUser from '../hooks/useUser';
import { useAuth0 } from '@auth0/auth0-react';
import CustomAlert from '../components/UI/CustomAlert';
import { changePassword } from '../util/users';

function PasswordResetPage() {
  const { getAccessTokenSilently } = useAuth0();
  const { user } = useUser();
  const { viewAs } = user;

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidations, setPasswordValidations] = useState({
    hasMinimumLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialCharacter: false,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setShowSuccessAlert(true);
      setPassword('');
      setPasswordError('');
      setPasswordValidations({
        hasMinimumLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialCharacter: false,
      });
      setConfirmPassword('');
    },
    onError: (error) => {
      console.log(error);
      setShowErrorAlert(true);
    },
  });

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsConfirmed(value === confirmPassword);

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

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setIsConfirmed(event.target.value === password);
  };

  const renderValidationIcon = (validation, label) => {
    if (validation) {
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    } else {
      return <ErrorIcon color='disabled' />;
    }
  };

  const handleSubmit = () => {
    const { userId } = viewAs || {};
    if (password === confirmPassword && userId) {
      mutate({ userId, passwordData: { password }, getAccessTokenSilently });
    } else {
      setShowErrorAlert(true);
    }
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Password reset failed!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Password reset successful!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <Typography variant='h4' component='h1'>
        Reset Your Password
      </Typography>
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
      <TextField
        label='Confirm Password'
        type='password'
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        fullWidth
        margin='normal'
        error={!isConfirmed && confirmPassword !== ''}
        helperText={
          !isConfirmed && confirmPassword !== '' ? "Passwords don't match" : ''
        }
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
      <Button
        variant='contained'
        color='primary'
        onClick={handleSubmit}
        disabled={!isConfirmed || !!passwordError}
      >
        Confirm
      </Button>
    </>
  );
}

export default PasswordResetPage;
