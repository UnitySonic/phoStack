import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  TextareaAutosize,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import useUser from '../hooks/useUser';
import Spinner from '../components/UI/Spinner';
import { useState, useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { changeOrganization } from '../util/organizations';
import { useMutation } from '@tanstack/react-query';
import CustomAlert from '../components/UI/CustomAlert';
import CancelIcon from '@mui/icons-material/Cancel';

const CompanyProfilePage = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const { viewAs } = user;
  const [editMode, setEditMode] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [dollarPerPoint, setDollarPerPoint] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [orgStatus, setOrgStatus] = useState('');
  const { getAccessTokenSilently } = useAuth0();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const orgId = viewAs?.selectedOrgId;
  const userOrganizations = viewAs?.organizations || [];
  const selectedOrganization = userOrganizations.find(
    (org) => org.orgId == orgId
  );

  useEffect(() => {
    setOrgName(selectedOrganization?.orgName || '');
    setOrgDescription(selectedOrganization?.orgDescription || '');
    setDollarPerPoint(selectedOrganization?.dollarPerPoint || 0.01);
    setJoinDate(selectedOrganization?.joinDate || '');
    setOrgStatus(selectedOrganization?.orgStatus || '');
  }, [selectedOrganization]);

  const { mutate } = useMutation({
    mutationFn: changeOrganization,
    onSuccess: () => {
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleSaveChanges = () => {
    if (orgId) {
      mutate({
        orgId,
        orgData: { orgName, orgDescription, dollarPerPoint: +dollarPerPoint },
        getAccessTokenSilently,
      });
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

  const handleOrgNameChange = (event) => {
    setOrgName(event.target.value);
  };

  const handleOrgDescriptionChange = (event) => {
    setOrgDescription(event.target.value);
  };

  const handleDollarPerPointChange = (event) => {
    setDollarPerPoint(event.target.value);
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
          <Typography variant='h5' align='center' gutterBottom>
            {orgName}
          </Typography>
          <Box sx={{ mx: 'auto', width: 'fit-content' }}>
            <form onSubmit={handleSaveChanges}>
              <TextField
                id='orgName'
                label='Organization Name'
                variant='outlined'
                fullWidth
                disabled={!editMode}
                onChange={handleOrgNameChange}
                value={orgName}
                sx={{ mb: 2 }}
              />
              <TextareaAutosize
                disabled={!editMode}
                aria-label='Description'
                placeholder='Description'
                value={orgDescription}
                onChange={handleOrgDescriptionChange}
                minRows={3}
                style={{
                  width: '100%',
                  marginBottom: '0.5rem',
                  padding: '8px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <TextField
                id='dollerPerPoint'
                label='Dollar Per Point'
                variant='outlined'
                fullWidth
                sx={{ mb: 2 }}
                disabled={!editMode}
                onChange={handleDollarPerPointChange}
                value={dollarPerPoint}
              />
            </form>
            <TextField
              id='status'
              label='Organization Status'
              value={orgStatus}
              variant='outlined'
              fullWidth
              sx={{ mb: 2 }}
              disabled
            />
            <TextField
              id='join_date'
              label='Join Date'
              value={joinDate}
              variant='outlined'
              fullWidth
              sx={{ mb: 2 }}
              disabled
            />
            {viewAs?.userType === 'SponsorUser' &&
              (editMode ? (
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
                    onClick={handleEditClick}
                    startIcon={<EditIcon />}
                    sx={{ mt: '1rem', mr: '1rem' }}
                  >
                    Edit
                  </Button>
                </>
              ))}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default CompanyProfilePage;
