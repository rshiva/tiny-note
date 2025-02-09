import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <input
      type="text"
      placeholder="Search notes..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
    />
  );
};

export default SearchBar;
