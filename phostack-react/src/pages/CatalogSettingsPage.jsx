import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation } from '@tanstack/react-query';
import { saveEbayParams } from '../util/ebay';
import { queryClient } from '../util/http';
import { getEbayParams } from '../util/ebay';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { categories } from '../util/category';
import CustomAlert from '../components/UI/CustomAlert';

function CatalogSettingsPage() {
  const orgID = 3;
  const { getAccessTokenSilently } = useAuth0();
  const [searchInput, setSearchInput] = useState('');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ebay_params', orgID],
    queryFn: ({ signal }) =>
      getEbayParams({ signal, orgID, getAccessTokenSilently }),
  });

  useEffect(() => {
    if (data?.length > 0) {
      console.log(data)
      setSearchInput(data[0].CatalogParamSearch || '');
      setMinPriceInput(+data[0].CatalogParamMinPrice || '');
      setMaxPriceInput(+data[0].CatalogParamMaxPrice || '');
      setSelectedCategory(data[0].CatalogParamCategories || '');
    }
  }, [data]);

  const { mutate, isPending, isSaveError, saveError } = useMutation({
    mutationFn: saveEbayParams,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ebay_products'] });
      setShowSuccessAlert(true);
    },
    onError: (error) => {
      setShowErrorAlert(true);
    },
  });

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleMinPriceChange = (event) => {
    setMinPriceInput(event.target.value);
  };

  const handleMaxPriceChange = (event) => {
    setMaxPriceInput(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const queryParams = {
      CatalogParamSearch: searchInput || null,
      CatalogParamMinPrice: minPriceInput || null,
      CatalogParamMaxPrice: maxPriceInput || null,
      CatalogParamCategories: selectedCategory || null,
    };
    console.log(queryParams);
    mutate({ orgID, queryParams, getAccessTokenSilently });
  };

  return (
    <>
      {showErrorAlert && (
        <CustomAlert
          type='error'
          message='Settings saved failed!'
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      {showSuccessAlert && (
        <CustomAlert
          type='success'
          message='Settings saved successfully!'
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label='Search'
          value={searchInput}
          onChange={handleSearchInputChange}
          fullWidth
          margin='normal'
        />
        <FormControl fullWidth margin='normal'>
          <InputLabel htmlFor='category'>Category</InputLabel>
          <Select
            id='category'
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <MenuItem value=''>None</MenuItem>
            {Object.entries(categories).map(([categoryName, categoryId]) => (
              <MenuItem key={categoryId} value={categoryId}>
                {categoryName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <InputLabel htmlFor='min_price'>Minimum Price</InputLabel>
          <Input
            id='min_price'
            type='number'
            value={minPriceInput}
            onChange={handleMinPriceChange}
            startAdornment={<InputAdornment position='start'>$</InputAdornment>}
          />
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <InputLabel htmlFor='max_price'>Maximum Price</InputLabel>
          <Input
            id='max_price'
            type='number'
            value={maxPriceInput}
            onChange={handleMaxPriceChange}
            startAdornment={<InputAdornment position='start'>$</InputAdornment>}
          />
        </FormControl>
        <Button variant='contained' color='primary' type='submit'>
          Save
        </Button>
      </form>
    </>
  );
}

export default CatalogSettingsPage;
