import React, { useState, useEffect } from 'react';
import { InputBase, Paper, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  // Debounce mechanism to delay search calls
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, 300); // 300ms delay

    // Cleanup timeout if user is still typing
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
        backgroundColor: '#e8e8e8',
        boxShadow: 'none',
      }}
    >
      <SearchIcon sx={{ color: '#888' }} />
      <InputBase
        placeholder="Find or start a chat"
        sx={{ ml: 1, flex: 1, color: '#333' }}
        inputProps={{ 'aria-label': 'search messages or users' }}
        value={query}
        onChange={handleSearchChange}
      />
      {query && (
        <IconButton 
          size="small" 
          aria-label="clear" 
          onClick={handleClearSearch}
          sx={{ padding: '4px' }}
        >
          <ClearIcon sx={{ fontSize: '1.2rem', color: '#888' }} />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;
