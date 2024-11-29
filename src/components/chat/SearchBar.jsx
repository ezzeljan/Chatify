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
        padding: '8px 12px',
        borderRadius: '20px',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : '#fff',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <SearchIcon sx={{ 
        color: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.7)' 
          : '#666',
        transition: 'color 0.3s ease',
      }} />
      <InputBase
        placeholder="Find or start a chat"
        sx={{ 
          ml: 1, 
          flex: 1, 
          color: theme.palette.mode === 'dark' 
            ? '#fff' 
            : 'rgba(0, 0, 0, 0.8)',
          '& ::placeholder': {
            color: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.5)'
              : 'rgba(0, 0, 0, 0.4)',
            opacity: 1,
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
              : 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ClearIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;
