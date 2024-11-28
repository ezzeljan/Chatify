import React, { useState, useEffect } from 'react';
import { InputBase, Paper, IconButton, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, onSearch]);

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <Paper
      component="form"
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '5px',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : '#e8e8e8',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'transparent',
      }}
    >
      <SearchIcon sx={{ 
        color: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.7)' 
          : '#888' 
      }} />
      <InputBase
        placeholder="Find or start a chat"
        sx={{ 
          ml: 1, 
          flex: 1, 
          color: theme.palette.text.primary,
          '& ::placeholder': {
            color: theme.palette.text.secondary,
            opacity: theme.palette.mode === 'dark' ? 0.5 : 0.7,
          },
        }}
        inputProps={{ 'aria-label': 'search messages or users' }}
        value={query}
        onChange={handleSearchChange}
      />
      {query && (
        <IconButton 
          size="small" 
          aria-label="clear" 
          onClick={handleClearSearch}
          sx={{ 
            padding: '4px',
            color: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.7)' 
              : '#888',
          }}
        >
          <ClearIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;
